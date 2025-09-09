import { useState } from "react"
import { useRouter } from "next/router"
import API from "../lib/api"
import { validateRegister, ValidationErrors } from "../lib/validation"

export default function Register() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("user")
  const [errors, setErrors] = useState<ValidationErrors>({})
  const router = useRouter()

  const handleRegister = async () => {
    const newErrors = validateRegister(name, email, password)
    setErrors(newErrors)
    if (Object.keys(newErrors).length) return

    try {
      await API.post("/auth/register", { name, email, password, role })
      alert("Registered successfully")
      router.push("/login")
    } catch (err: any) {
      alert("Registration failed: " + (err.response?.data?.message || "Unknown error"))
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-50 p-6 border rounded shadow bg-orange-200 border-transparent font-serif">
      <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>

      <input type="text" 
        placeholder="Name" 
        className="border p-2 w-full mt-2 rounded  border-gray-500" 
        value={name} 
        onChange={e => setName(e.target.value)} />
      {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}

      <input type="text" 
        placeholder="Email" 
        className="border p-2 w-full mt-5 rounded  border-gray-500" 
        value={email} 
        onChange={e => setEmail(e.target.value)} />
      {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}

      <input type="text" 
        placeholder="Password" 
        className="border p-2 w-full mt-5 rounded  border-gray-500" 
        value={password} 
        onChange={e => setPassword(e.target.value)} />
      {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}

      <select value={role} onChange={e => setRole(e.target.value)} className="border p-2 w-30 mt-4 rounded  border-gray-500">
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <br />

      <button onClick={handleRegister} className="bg-blue-600 text-white p-2 mt-5 w-35 rounded font-bold mx-25">Register</button>

      <p className="mt-4 text-center">
        Already have an account? <a className="text-blue-600 underline" href="/login">Login</a>
      </p>
    </div>
  )
}
