import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Eye, EyeOff, Mail, Lock, User, Phone, Building, AlertCircle } from "lucide-react"
import logoAtendeAi from "@/assets/LogoAtendeAi-novo.png"
import logoLify from "@/assets/logo-lify.png"
import { TERMINOLOGY, getSuggestedInstitutionName } from "@/constants/terminology"

const SignUp = () => {
  const navigate = useNavigate()
  const { register } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [institutionType, setInstitutionType] = useState("")
  const [institutionName, setInstitutionName] = useState("")
  
  // Estados para validação
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (fullName && institutionType) {
      const [firstName] = fullName.split(" ")
      const suggestedName = getSuggestedInstitutionName(institutionType, firstName)
      setInstitutionName(suggestedName)
    } else {
      setInstitutionName("")
    }
  }, [fullName, institutionType])

  const handleSocialSignUp = (provider: string) => {
    alert(`Cadastro com ${provider} - A ser implementado!`)
  }

  const formatPhone = (value: string) => {
    if (!value) return ""
    value = value.replace(/\D/g, "")
    if (value.length > 10) {
      value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3")
    } else if (value.length > 5) {
      value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3")
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{0,5}).*/, "($1) $2")
    } else {
      value = value.replace(/^(\d*)/, "($1")
    }
    return value
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setPhone(formatted)
  }

  // Funções de validação
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return 'Nome completo é obrigatório'
        if (value.trim().length < 2) return 'Nome deve ter pelo menos 2 caracteres'
        if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value.trim())) return 'Nome deve conter apenas letras'
        return ''
      
      case 'email':
        if (!value.trim()) return 'E-mail é obrigatório'
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) return 'E-mail inválido'
        return ''
      
      case 'phone':
        if (!value.trim()) return 'Telefone é obrigatório'
        const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/
        if (!phoneRegex.test(value)) return 'Telefone inválido'
        return ''
      
      case 'password':
        if (!value) return 'Senha é obrigatória'
        if (value.length < 6) return 'Senha deve ter pelo menos 6 caracteres'
        return ''
      
      case 'institutionType':
        if (!value) return 'Tipo de instituição é obrigatório'
        return ''
      
      case 'institutionName':
        if (!value.trim()) return 'Nome da instituição é obrigatório'
        if (value.trim().length < 2) return 'Nome da instituição deve ter pelo menos 2 caracteres'
        return ''
      
      default:
        return ''
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    newErrors.fullName = validateField('fullName', fullName)
    newErrors.email = validateField('email', email)
    newErrors.phone = validateField('phone', phone)
    newErrors.password = validateField('password', password)
    newErrors.institutionType = validateField('institutionType', institutionType)
    newErrors.institutionName = validateField('institutionName', institutionName)
    
    setErrors(newErrors)
    
    return !Object.values(newErrors).some(error => error !== '')
  }

  const handleFieldBlur = (name: string, value: string) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    const error = validateField(name, value)
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    // Validar formulário
    if (!validateForm()) {
      setLoading(false)
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os campos destacados",
        variant: "destructive",
      })
      return
    }
    
    try {
      const userData = {
        fullName,
        email,
        phone,
        password,
        institutionType,
        institutionName: institutionName || `${institutionType} - ${fullName}`,
        global_role: 'client_user'
      }
      
      await register(userData)
      
      // Toast de sucesso
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo! Você foi automaticamente logado.",
      })
      
      // Navegar para a área logada imediatamente
      navigate("/")
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao criar conta"
      setError(errorMessage)
      toast({
        title: "Erro ao criar conta",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-background p-8 pb-20">
        <div className="w-full max-w-md">
          {/* Logo Principal */}
          <div className="text-center mb-8">
            <img
              src={logoAtendeAi}
              alt="AtendeAI"
              className="h-24 w-auto mx-auto"
            />
          </div>

          <Card className="border-0 shadow-none bg-transparent">
            <CardContent className="space-y-4 p-0">
              {/* Login Social */}
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 text-sm font-medium"
                  onClick={() => handleSocialSignUp('google')}
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
                  Cadastrar com Google
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 text-sm font-medium"
                  onClick={() => handleSocialSignUp('facebook')}
                >
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Cadastrar com Facebook
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
                     <form onSubmit={handleSignUp} className="space-y-3">
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Nome completo"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      onBlur={() => handleFieldBlur('fullName', fullName)}
                      className={`pl-10 h-11 border-0 bg-muted/30 ${
                        touched.fullName && errors.fullName ? 'border-red-500' : ''
                      }`}
                      required
                    />
                  </div>
                  {touched.fullName && errors.fullName && (
                    <div className="flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      {errors.fullName}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="E-mail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => handleFieldBlur('email', email)}
                      className={`pl-10 h-11 border-0 bg-muted/30 ${
                        touched.email && errors.email ? 'border-red-500' : ''
                      }`}
                      required
                    />
                  </div>
                  {touched.email && errors.email && (
                    <div className="flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(11) 96123-4567"
                      value={phone}
                      onChange={handlePhoneChange}
                      onBlur={() => handleFieldBlur('phone', phone)}
                      className={`pl-10 h-11 border-0 bg-muted/30 ${
                        touched.phone && errors.phone ? 'border-red-500' : ''
                      }`}
                      maxLength={15}
                      required
                    />
                  </div>
                  {touched.phone && errors.phone && (
                    <div className="flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      {errors.phone}
                    </div>
                  )}
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
                      onBlur={() => handleFieldBlur('password', password)}
                      className={`pl-10 pr-10 h-11 border-0 bg-muted/30 ${
                        touched.password && errors.password ? 'border-red-500' : ''
                      }`}
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
                  {touched.password && errors.password && (
                    <div className="flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      {errors.password}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Select 
                    value={institutionType} 
                    onValueChange={(value) => {
                      setInstitutionType(value)
                      handleFieldBlur('institutionType', value)
                    }}
                    required
                  >
                    <SelectTrigger className={`h-11 border-0 bg-muted/30 ${
                      touched.institutionType && errors.institutionType ? 'border-red-500' : ''
                    }`}>
                      <SelectValue placeholder={TERMINOLOGY.PLACEHOLDERS.institutionType} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hospital">{TERMINOLOGY.INSTITUTION_TYPES.hospital}</SelectItem>
                      <SelectItem value="clinica">{TERMINOLOGY.INSTITUTION_TYPES.clinica}</SelectItem>
                      <SelectItem value="consultor">{TERMINOLOGY.INSTITUTION_TYPES.consultor}</SelectItem>
                      <SelectItem value="grupo">{TERMINOLOGY.INSTITUTION_TYPES.grupo}</SelectItem>
                    </SelectContent>
                  </Select>
                  {touched.institutionType && errors.institutionType && (
                    <div className="flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      {errors.institutionType}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="institutionName"
                      type="text"
                      placeholder={TERMINOLOGY.PLACEHOLDERS.institutionName}
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      onBlur={() => handleFieldBlur('institutionName', institutionName)}
                      className={`pl-10 h-11 border-0 bg-muted/30 ${
                        touched.institutionName && errors.institutionName ? 'border-red-500' : ''
                      }`}
                      required
                    />
                  </div>
                  {touched.institutionName && errors.institutionName && (
                    <div className="flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      {errors.institutionName}
                    </div>
                  )}
                  {fullName && institutionType && !errors.institutionName && (
                    <p className="text-xs text-muted-foreground">
                      Sugestão baseada no seu nome e tipo de {TERMINOLOGY.INSTITUTION.singularLower}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-sm font-semibold"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Criando conta...
                    </div>
                  ) : (
                    "Criar conta"
                  )}
                </Button>
              </form>

              <div className="text-center">
                <span className="text-sm text-muted-foreground">
                  Já possui conta?{" "}
                  <button
                    onClick={() => navigate("/login")}
                    className="text-primary hover:underline font-medium"
                  >
                    Faça login
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

export default SignUp
