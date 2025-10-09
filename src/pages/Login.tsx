import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import logoAtendeAi from "@/assets/LogoAtendeAi-novo.png"
import logoLify from "@/assets/logo-lify.png"

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  
  // Form states
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    try {
      await login(email, password)
      navigate("/")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro ao fazer login")
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    // TODO: Implementar login social
    console.log(`Login com ${provider}`)
  }

  const handleForgotPassword = () => {
    navigate("/forgot-password")
  }

  const handleSignUp = () => {
    navigate("/signup")
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-background p-8 pb-20">
        <div className="w-full max-w-md">
        {/* Logo Principal */}
        <div className="text-center mb-12">
          <img 
            src={logoAtendeAi} 
            alt="AtendeAI" 
            className="h-40 w-auto mx-auto"
          />
        </div>

        <Card className="border-0 shadow-none bg-transparent">
          <CardContent className="space-y-6 p-0">
            {/* Login Social */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 text-sm font-medium"
                onClick={() => handleSocialLogin('google')}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Entrar com Google
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 text-sm font-medium"
                onClick={() => handleSocialLogin('facebook')}
              >
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Entrar com Facebook
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  ou
                </span>
              </div>
            </div>

                     {/* Exibir erro se houver */}
                     {error && (
                       <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                         {error}
                       </div>
                     )}

                     {/* Formulário */}
                     <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-0 bg-muted/30"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 border-0 bg-muted/30"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-sm font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Entrando...
                  </div>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            <div className="text-center">
              <button
                onClick={handleForgotPassword}
                className="text-sm text-muted-foreground hover:text-primary hover:underline"
              >
                Esqueci minha senha
              </button>
            </div>

            <div className="text-center">
              <span className="text-sm text-muted-foreground">
                Ainda não possui conta?{" "}
                <button
                  onClick={handleSignUp}
                  className="text-primary hover:underline font-medium"
                >
                  Cadastre-se
                </button>
              </span>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Footer Fixo - Powered by Lify */}
      <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border/20 py-4">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>Powered by</span>
          <img 
            src={logoLify} 
            alt="Lify" 
            className="h-4 w-auto opacity-70"
          />
        </div>
      </footer>
    </>
  )
}

export default Login