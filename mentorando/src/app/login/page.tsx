'use client'

import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { FcGoogle } from 'react-icons/fc'
import { FaLinkedin } from 'react-icons/fa'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Verificar se já está logado
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        router.push('/dashboard')
      }
    }
    checkSession()
  }, [router])

  const handleSignIn = async (provider: 'google' | 'linkedin') => {
    try {
      setIsLoading(true)
      await signIn(provider, { 
        callbackUrl: '/dashboard',
        redirect: true 
      })
    } catch (error) {
      console.error('Erro no login:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo e Título */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold text-white">M</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mentorando</h1>
            <p className="text-gray-600 mt-2">
              Conecte-se com mentores e acelere seu crescimento profissional
            </p>
          </div>
        </div>

        {/* Card de Login */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900">
              Entre ou Cadastre-se
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Escolha uma das opções abaixo para continuar
            </p>
          </div>

          <div className="space-y-4">
            {/* Botão Google */}
            <button
              onClick={() => handleSignIn('google')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FcGoogle className="w-5 h-5" />
              <span className="font-medium">Continuar com Google</span>
            </button>

            {/* Botão LinkedIn */}
            <button
              onClick={() => handleSignIn('linkedin')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#0077B5] text-white rounded-lg shadow-sm hover:bg-[#005885] focus:outline-none focus:ring-2 focus:ring-[#0077B5] focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaLinkedin className="w-5 h-5" />
              <span className="font-medium">Continuar com LinkedIn</span>
            </button>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              <span className="ml-2 text-sm text-gray-600">Conectando...</span>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 gap-4 text-center">
          <div className="bg-white/50 rounded-lg p-4">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-primary-600 text-sm">🎯</span>
            </div>
            <h3 className="font-medium text-gray-900">Mentores Especializados</h3>
            <p className="text-xs text-gray-600 mt-1">
              Encontre mentores com experiência na sua área
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>
            Ao continuar, você concorda com nossos{' '}
            <a href="#" className="text-primary-600 hover:underline">
              Termos de Uso
            </a>{' '}
            e{' '}
            <a href="#" className="text-primary-600 hover:underline">
              Política de Privacidade
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}