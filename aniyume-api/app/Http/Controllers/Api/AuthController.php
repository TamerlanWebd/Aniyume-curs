<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Kreait\Firebase\Factory;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    /**
     * Create a new AuthController instance.
     *
     * @return void
     */
    public function __construct()
    {
        // Apply auth middleware to everything except login, register, and firebaseLogin
        $this->middleware('auth:api', ['except' => ['login', 'register', 'firebaseLogin']]);
    }

    /**
     * Register a User.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|between:2,100',
            'email' => 'required|string|email|max:100|unique:users',
            'password' => 'required|string|min:6',
        ]);

        if($validator->fails()){
            return response()->json($validator->errors()->toJson(), 400);
        }

        $user = User::create(array_merge(
                    $validator->validated(),
                    ['password' => bcrypt($request->password)]
                ));

        return response()->json([
            'message' => 'User successfully registered',
            'user' => $user
        ], 201);
    }

    /**
     * Get a JWT via given credentials.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        if (! $token = auth()->attempt($validator->validated())) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return $this->createNewToken($token);
    }

    /**
     * Login with Firebase ID Token.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function firebaseLogin(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        try {
            // Initialize Firebase Auth
            // Assuming credentials are in the default location or configured via env
            // If using the specific path from FirebaseService:
            $path = storage_path('app/firebase/firebase-credentials.json');
            $factory = (new Factory)->withServiceAccount($path);
            $auth = $factory->createAuth();

            $verifiedIdToken = $auth->verifyIdToken($request->token);
            $uid = $verifiedIdToken->claims()->get('sub');
            $email = $verifiedIdToken->claims()->get('email');
            $name = $verifiedIdToken->claims()->get('name');
            $picture = $verifiedIdToken->claims()->get('picture');

            // Find or Create User
            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => $name ?? 'User',
                    'firebase_uid' => $uid,
                    'avatar_url' => $picture,
                    'password' => Hash::make(str_random(16)), // Random password for social login
                ]
            );

            // Update firebase_uid if it was missing (e.g. existing email user)
            if (!$user->firebase_uid) {
                $user->update(['firebase_uid' => $uid]);
            }
             // Update avatar if missing
            if (!$user->avatar_url && $picture) {
                $user->update(['avatar_url' => $picture]);
            }

            // Generate JWT for the user
            $token = auth()->login($user);

            return $this->createNewToken($token);

        } catch (\Exception $e) {
            \Log::error('Firebase Login Error: ' . $e->getMessage());
            return response()->json(['error' => 'Unauthorized: ' . $e->getMessage()], 401);
        }
    }

    /**
     * Log the user out (Invalidate the token).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout()
    {
        auth()->logout();

        return response()->json(['message' => 'User successfully signed out']);
    }

    /**
     * Refresh a token.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function refresh()
    {
        return $this->createNewToken(auth()->refresh());
    }

    /**
     * Get the authenticated User.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function me()
    {
        return response()->json(auth()->user());
    }

    /**
     * Get the token array structure.
     *
     * @param  string $token
     *
     * @return \Illuminate\Http\JsonResponse
     */
    protected function createNewToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth()->factory()->getTTL() * 60,
            'user' => auth()->user()
        ]);
    }
}
