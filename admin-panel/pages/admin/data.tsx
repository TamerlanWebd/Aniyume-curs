import { useEffect } from "react";
import api from "../../lib/api";

export default function AdminData() {
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get("/admin/data");
        console.log("Admin data loaded:", res.data);
      } catch (e) {
        console.log("Error admin data", e);
      }
    }
    fetchData();
  }, []);

  return <div>Data loading...</div>;
}
