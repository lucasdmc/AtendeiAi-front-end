import { useState } from "react"
import { useNavigate } from "react-router-dom"
import authService from "@/services/authService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Mail, CheckCircle } from "lucide-react"
import logoAtendeAi from "@/assets/LogoAtendeAi-novo.png"
import logoLify from "@/assets/logo-lify.png"
import whatsappLogo from "@/assets/images/icons/whatsapp_logo.webp"

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState<'method' | 'email' | 'phone' | 'success'>('method')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [selectedMethod, setSelectedMethod] = useState<'email' | 'whatsapp' | null>(null)

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

  const handleMethodSelect = (method: 'email' | 'whatsapp') => {
    setSelectedMethod(method)
    if (method === 'email') {
      setStep('email')
    } else {
      setStep('phone')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    try {
      if (step === 'email') {
        await authService.forgotPassword({ email, method: 'email' })
      } else if (step === 'phone') {
        await authService.forgotPassword({ email: phone, method: 'whatsapp' })
      }
      setStep('success')
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro ao enviar código de recuperação")
    } finally {
      setLoading(false)
    }
  }

  const handleBackToLogin = () => {
    navigate("/login")
  }

  const handleBackToMethod = () => {
    setStep('method')
    setSelectedMethod(null)
    setEmail("")
    setPhone("")
  }

  const renderMethodSelection = () => (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Esqueci minha senha
        </h1>
        <p className="text-muted-foreground">
          Escolha como você gostaria de recuperar sua senha
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => handleMethodSelect('email')}
          className="w-full p-6 border border-border rounded-lg hover:bg-muted/50 transition-colors text-left"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Recuperar por E-mail</h3>
              <p className="text-sm text-muted-foreground">
                Enviaremos um link de recuperação para seu e-mail
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleMethodSelect('whatsapp')}
          className="w-full p-6 border border-border rounded-lg hover:bg-muted/50 transition-colors text-left"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center">
              <img 
                src={whatsappLogo} 
                alt="WhatsApp" 
                className="w-12 h-12 rounded-full"
              />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Recuperar por WhatsApp</h3>
              <p className="text-sm text-muted-foreground">
                Enviaremos um código de verificação via WhatsApp
              </p>
            </div>
          </div>
        </button>
      </div>
    </>
  )

  const renderEmailForm = () => (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Recuperar por E-mail
        </h1>
        <p className="text-muted-foreground">
          Digite seu e-mail para receber o link de recuperação
        </p>
      </div>

      {/* Exibir erro se houver */}
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              id="email"
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12 border-0 bg-muted/30"
              required
            />
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
              Enviando...
            </div>
          ) : (
            "Enviar link de recuperação"
          )}
        </Button>
      </form>
    </>
  )

  const renderPhoneForm = () => (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Recuperar por WhatsApp
        </h1>
        <p className="text-muted-foreground">
          Digite seu WhatsApp para receber o código de verificação
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center">
              <img 
                src={whatsappLogo} 
                alt="WhatsApp" 
                className="w-5 h-5 rounded-full"
              />
            </div>
            <Input
              id="phone"
              type="tel"
              placeholder="(11) 96123-4567"
              value={phone}
              onChange={handlePhoneChange}
              className="pl-10 h-12 border-0 bg-muted/30"
              maxLength={15}
              required
            />
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
              Enviando...
            </div>
          ) : (
            "Enviar código via WhatsApp"
          )}
        </Button>
      </form>
    </>
  )

  const renderSuccess = () => (
    <>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          {selectedMethod === 'email' ? 'E-mail enviado!' : 'Código enviado!'}
        </h1>
        <p className="text-muted-foreground">
          {selectedMethod === 'email' 
            ? `Enviamos um link de recuperação para ${email}. Verifique sua caixa de entrada e spam.`
            : `Enviamos um código de verificação para ${phone} via WhatsApp.`
          }
        </p>
      </div>

      <div className="space-y-4">
        <Button
          onClick={handleBackToLogin}
          className="w-full h-12 text-sm font-semibold"
        >
          Voltar para o Login
        </Button>
        
        <button
          onClick={handleBackToMethod}
          className="w-full text-sm text-muted-foreground hover:text-primary"
        >
          Tentar outro método
        </button>
      </div>
    </>
  )

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-background p-8 pb-20">
        <div className="w-full max-w-md">
          {/* Logo Principal */}
          <div className="text-center mb-8">
            <img
              src={logoAtendeAi}
              alt="AtendeAI"
              className="h-32 w-auto mx-auto"
            />
          </div>

          <Card className="border-0 shadow-none bg-transparent">
            <CardContent className="space-y-6 p-0">
              {/* Botão Voltar */}
              {step !== 'method' && step !== 'success' && (
                <button
                  onClick={handleBackToMethod}
                  className="flex items-center text-muted-foreground hover:text-primary mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </button>
              )}

              {step === 'method' && renderMethodSelection()}
              {step === 'email' && renderEmailForm()}
              {step === 'phone' && renderPhoneForm()}
              {step === 'success' && renderSuccess()}

              {/* Link para Login */}
              {step === 'method' && (
                <div className="text-center">
                  <button
                    onClick={handleBackToLogin}
                    className="text-sm text-muted-foreground hover:text-primary hover:underline"
                  >
                    Lembrei da senha, fazer login
                  </button>
                </div>
              )}
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

export default ForgotPassword
