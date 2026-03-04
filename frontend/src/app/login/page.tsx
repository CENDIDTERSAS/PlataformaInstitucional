'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, KeyRound, User, Lock, Eye, EyeOff } from 'lucide-react';

const LoginContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: var(--white);
`;

const CarouselSection = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  background-color: var(--gray-100);
  display: none;
  
  @media (min-width: 1024px) {
    display: block;
  }
`;

const CarouselImage = styled(motion.div) <{ $bg: string }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(${props => props.$bg});
  background-size: cover;
  background-position: center;
`;

const CarouselOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 4rem;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  color: white;
  z-index: 10;
`;

const FormSection = styled.div`
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 4rem 3rem;
  background: white;

  @media (max-width: 1024px) {
    max-width: 100%;
  }
`;

const LogoContainer = styled.div`
  margin-bottom: 3rem;
  text-align: center;
  
  img {
    height: 80px;
  }
`;

const Title = styled.h1`
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 0.5rem;
  text-align: center;
  letter-spacing: -0.5px;
`;

const Subtitle = styled.p`
  color: var(--secondary);
  margin-bottom: 3rem;
  text-align: center;
  font-size: 1.1rem;
`;

const InputGroup = styled.div`
  margin-bottom: 1.5rem;
  position: relative;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.75rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InputWrapper = styled.div<{ $isFocused: boolean }>`
  display: flex;
  align-items: center;
  padding: 0 1rem;
  background: var(--gray-100);
  border: 2px solid ${props => props.$isFocused ? 'var(--primary)' : 'transparent'};
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.$isFocused ? '0 0 0 4px rgba(26, 115, 232, 0.1)' : 'none'};

  &:hover {
    background: #eef1f4;
  }
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 1rem 0.5rem;
  background: transparent;
  border: none;
  outline: none;
  font-size: 1rem;
  color: var(--text);
  font-weight: 500;

  &::placeholder {
    color: #9aa0a6;
    font-weight: 400;
  }
`;

const IconWrapper = styled.div<{ $active: boolean }>`
  color: ${props => props.$active ? 'var(--primary)' : '#5f6368'};
  display: flex;
  align-items: center;
  transition: color 0.3s;
`;

const Button = styled.button`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, var(--primary) 0%, #1557b0 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-top: 2rem;
  box-shadow: 0 4px 6px rgba(26, 115, 232, 0.2);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 12px rgba(26, 115, 232, 0.3);
  }

  &:active {
    transform: translateY(1px);
  }
`;

const LinkButton = styled.button`
  background: none;
  border: none;
  color: var(--primary);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1.5rem;
  text-align: center;
  width: 100%;
  transition: color 0.2s;

  &:hover {
    color: #1557b0;
    text-decoration: underline;
  }
`;

import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const slides = [
  {
    image: 'https://i.ytimg.com/vi/mUnyQ8Fofuc/maxresdefault.jpg',
    title: 'Gestión Centralizada',
    description: 'Todas tus actividades institucionales en un solo lugar.'
  },
  {
    image: 'https://i.ytimg.com/vi/yf5YnZqAdi0/maxresdefault.jpg',
    title: 'Gestión Centralizada',
    description: 'Todas tus actividades institucionales en un solo lugar.'
  },
  {
    image: 'https://www.cendidter.com/wp-content/uploads/elementor/thumbs/Sede-3-ohej3cz848pmbx5die8luvu57fjjb76x1gbkq9bq30.jpg',
    title: 'Gestión Centralizada',
    description: 'Todas tus actividades institucionales en un solo lugar.'
  },
  {
    image: 'https://i.ytimg.com/vi/DNEeJg67FZs/maxresdefault.jpg',
    title: 'Gestión Centralizada',
    description: 'Todas tus actividades institucionales en un solo lugar.'
  }
];

export default function LoginPage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [userFocused, setUserFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.user) {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <CarouselSection>
        <AnimatePresence mode='wait'>
          <CarouselImage
            key={currentSlide}
            $bg={slides[currentSlide].image}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          />
        </AnimatePresence>
        <CarouselOverlay>
          <motion.h2
            key={`title-${currentSlide}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}
          >
            {slides[currentSlide].title}
          </motion.h2>
          <motion.p
            key={`desc-${currentSlide}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ fontSize: '1.2rem', opacity: 0.9 }}
          >
            {slides[currentSlide].description}
          </motion.p>
        </CarouselOverlay>
      </CarouselSection>

      <FormSection>
        <LogoContainer>
          <motion.img
            src="https://www.cendidter.com/wp-content/uploads/2021/11/logo-cendidter-01-150x150.png"
            alt="Cendidter Logo"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ height: '120px', width: 'auto', marginBottom: '1rem' }}
          />
        </LogoContainer>

        <Title>Bienvenido de nuevo</Title>
        <Subtitle>Accede a tu panel de control digital</Subtitle>

        <form onSubmit={handleLogin}>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ color: '#dc2626', background: '#fef2f2', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center', border: '1px solid #fee2e2' }}
            >
              {error}
            </motion.div>
          )}
          <InputGroup>
            <Label>Usuario Institucional</Label>
            <InputWrapper $isFocused={userFocused}>
              <IconWrapper $active={userFocused}>
                <User size={20} />
              </IconWrapper>
              <StyledInput
                type="email"
                placeholder="ej. j.perez@institucion.edu"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setUserFocused(true)}
                onBlur={() => setUserFocused(false)}
              />
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <Label>Contraseña</Label>
            <InputWrapper $isFocused={passFocused}>
              <IconWrapper $active={passFocused}>
                <Lock size={20} />
              </IconWrapper>
              <StyledInput
                type="password"
                placeholder="Ingresa tu contraseña"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPassFocused(true)}
                onBlur={() => setPassFocused(false)}
              />
            </InputWrapper>
          </InputGroup>

          <Button type="submit" disabled={loading}>
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            {!loading && <LogIn size={20} />}
          </Button>

          <LinkButton type="button">
            <KeyRound size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            ¿Olvidaste tu contraseña?
          </LinkButton>
        </form>
      </FormSection>
    </LoginContainer>
  );
}
