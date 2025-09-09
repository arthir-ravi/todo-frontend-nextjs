import { useState } from "react"
import { useRouter } from "next/router"
import API from "../lib/api"
import { validateLogin, ValidationErrors } from "../lib/validation"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [serverError, setServerError] = useState("")
  const router = useRouter()

  const handleLogin = async () => {
    setServerError("");
    const newErrors = validateLogin(email, password)
    setErrors(newErrors)
    if (Object.keys(newErrors).length) return;

    try {
      const res = await API.post<{ access_token: string }>("/auth/login", { email, password })
      localStorage.setItem("token", res.data.access_token)
      alert("login Successfully")
      router.push("/todos")
    } catch (err: any) {
      if (err.response?.status === 401) 
        setServerError("Incorrect email or password")
      else 
        setServerError("Something went wrong. Please try again.")
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-55 p-6 rounded shadow bg-orange-200 font-serif">
      <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

      <input type="text" 
        placeholder="Email" 
        className="border border-gray-500 p-2 w-full mb-2 hover:border-amber-600 rounded"
        value={email} 
        onChange={e => setEmail(e.target.value)} 
        />
      {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}

      <input type="password" 
        placeholder="Password" 
        className="border border-gray-500 p-2 w-full mb-2 mt-5 hover:border-amber-600 rounded"
        value={password} 
        onChange={e => setPassword(e.target.value)} 
      />
      {errors.password && <p className="text-red-600 text-sm">{errors.password}</p>}
      {serverError && <p className="text-red-600 text-sm">{serverError}</p>}

      <button onClick={handleLogin} className="bg-blue-600 text-white p-2 w-35 mt-4 rounded mx-25 font-bold">Login</button>

      <p className="mt-4 text-center">
        Don't have an account? <a className="text-blue-600 underline" href="/register">Register</a>
      </p>
    </div>
  )
}
