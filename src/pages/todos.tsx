import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import API from "../lib/api";
import Header from "../components/Header";
import TodoList from "../components/TodoList";
import { Todo, User } from "../types/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { onMessage } from "firebase/messaging";
import { generateToken, getMessagingInstance } from "@/lib/firebase";

export default function Todos() {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [usersInfo, setUsersInfo] = useState<Record<string, string>>({});
  const [selectedUserId, setSelectedUserId] = useState("all");

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit] = useState(7);
  const [totalPages, setTotalPages] = useState(1);
  const [dateTime, setDateTime] = useState<string>("");

  const loadTodosRef = useRef<() => Promise<void>>(async () => {});

  const loadTodos = async (): Promise<void> => {
    const token = localStorage.getItem("token");
    if (!token) {
      await router.push("/login");
      return;
    }

    try {
      const { data: currentUser } = await API.get<User>("/auth/me");
      setUser(currentUser);

      if (currentUser.role === "admin") {
        const { data: allUsers } = await API.get<User[]>("/auth/all-users");
        const userInfo: Record<string, string> = {};
        allUsers.filter(u => u.role === "user").forEach(u => (userInfo[u._id] = u.name));
        setUsersInfo(userInfo);

        let url = `/todos/all-todos?page=${page}&limit=${limit}`;
        if (selectedUserId && selectedUserId !== "all") url += `&userId=${selectedUserId}`;

        const res = await API.get<{ data: Todo[]; meta: any }>(url);
        setTodos(res.data.data);
        setTotalPages(res.data.meta.totalPages);
      } else {
        const res = await API.get<{ data: Todo[]; meta: any }>(`/todos?page=${page}&limit=${limit}`);
        setTodos(res.data.data);
        setTotalPages(res.data.meta.totalPages);
      }
    } catch (err) {
      console.error(err);
      await router.push("/login");
    }
  };

  useEffect(() => {
    loadTodosRef.current = async () => {
      await loadTodos();
    };
  }, [page, selectedUserId]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then(() => generateToken())
        .catch(err => console.error("SW registration failed", err));
    }
    const messaging = getMessagingInstance();
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, payload => {
      console.log("Foreground message:", payload);
      if (Notification.permission === "granted") {
        new Notification(payload.notification?.title || "New Notification", {
          body: payload.notification?.body || "You have a new message",
        });
      }

      if (payload.data?.action === "reloadTodos") {
        loadTodosRef.current();
      }
    });

    return () => {
      unsubscribe && unsubscribe();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDateTime(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    loadTodos();
  }, [selectedUserId, page]);


  const addTodo = async () => {
    if (!newTodo.trim() || user?.role === "admin") return;
    await API.post("/todos", { description: newTodo });
    setNewTodo("");
    await loadTodos();
  };

  const deleteTodo = async (id: string) => {
    if (!confirm("Delete this todo?")) return;
    const endpoint = user?.role === "admin" ? `/todos/all-todos/${id}` : `/todos/${id}`;
    await API.delete(endpoint);
    await loadTodos();
  };

  const updateTodo = async (id: string, currentDescription: string) => {
    const newDescription = prompt("Update todo:", currentDescription);
    if (!newDescription?.trim()) return;

    const endpoint = user?.role === "admin" ? `/todos/all-todos/${id}` : `/todos/${id}`;
    await API.put(endpoint, { description: newDescription });
    await loadTodos();
  };

  const toggleComplete = async (id: string, currentStatus: boolean) => {
    const endpoint = user?.role === "admin" ? `/todos/all-todos/${id}` : `/todos/${id}`;
    try {
      await API.put(endpoint, { complete: !currentStatus });
      await loadTodos();
    } catch (err) {
      console.error("Failed to update todo:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-950 via-teal-800 to-teal-950 flex justify-center p-4">
      <div className="w-full max-w-4xl text-white rounded-2xl p-8">
        <Header title = {user?.role === "admin" ? "All Users Todos" : "My Todos"} username = {user?.name} userRole={user?.role} />

        {user?.role !== "admin" && (
          <div className="flex mb-6 gap-2">
            <input
              type="text"
              className="flex-1 p-3 mt-3 rounded-full bg-gray-800 border border-gray-700"
              placeholder="Add your todos..."
              value={newTodo}
              onChange={e => setNewTodo(e.target.value)}
            />
            <button onClick={addTodo} className="bg-teal-600 hover:bg-teal-700 rounded-2xl px-4 mt-4 font-semibold w-30 h-10">Add</button>
          </div>
        )}

        {user?.role === "admin" && (
          <div className="relative w-full mb-6 mt-2">
            <select className="w-full p-3 pr-10 rounded-full bg-teal-900 border border-teal-700 text-white appearance-none" value={selectedUserId}
              onChange={e => { setSelectedUserId(e.target.value); setPage(1);}}
            >
              <option value="">-- Select User --</option>
              <option value="all">All Todos</option>
              {Object.keys(usersInfo).map(uid => (
                <option key={uid} value={uid}>
                  {usersInfo[uid]}
                </option>
              ))}
            </select>
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300">
              <FontAwesomeIcon icon={faChevronDown} />
            </span>
          </div>
        )}

        <p className="text-center text-gray-300 mb-6">{dateTime}</p>

        <ul className="flex flex-col items-center justify-center">
          <TodoList
            todos={todos}
            onDelete={deleteTodo}
            onUpdate={updateTodo}
            onToggleComplete={toggleComplete}
            userRole={user?.role}
          />
        </ul>

        <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center mt-6 text-gray-200 gap-2">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="w-full sm:w-auto px-4 py-2 rounded-full border border-gray-900 disabled:opacity-50">Previous</button>
          <span className="text-center w-full sm:w-auto">Page {page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="w-full sm:w-auto px-4 py-2 rounded-full border border-gray-900 disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
}
