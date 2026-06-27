// ResetPassword.jsx — bas itna rakh do
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ResetPassword() {
  const navigate = useNavigate()
  useEffect(() => { navigate('/forgot-password') }, [])
  return null
}