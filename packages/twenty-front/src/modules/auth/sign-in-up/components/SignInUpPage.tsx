import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuthContext } from '@/auth/hooks/useAuthContext';
import styles from './SignInUpPage.module.css';

export const SignInUpPage = () => {
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuthContext();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signIn') {
        await signIn(email, password);
      } else {
        await signUp(email, password, fullName);
      }
      navigate('/');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'signIn' ? 'signUp' : 'signIn');
    setError(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>
          {mode === 'signIn' ? 'Entrar' : 'Criar conta'}
        </h1>
        <p className={styles.subtitle}>
          {mode === 'signIn'
            ? 'Acesse sua conta do CRM Contábil'
            : 'Crie sua conta para começar'}
        </p>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          {mode === 'signUp' && (
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="fullName">
                Nome completo
              </label>
              <input
                className={styles.input}
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome completo"
                required
              />
            </div>
          )}

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="email">
              E-mail
            </label>
            <input
              className={styles.input}
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="password">
              Senha
            </label>
            <input
              className={styles.input}
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              required
            />
          </div>

          <button
            className={styles.button}
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Aguarde...'
              : mode === 'signIn'
                ? 'Entrar'
                : 'Criar conta'}
          </button>
        </form>

        <p className={styles.toggleText}>
          {mode === 'signIn' ? 'Não tem conta?' : 'Já tem conta?'}
          <button
            className={styles.toggleButton}
            type="button"
            onClick={toggleMode}
          >
            {mode === 'signIn' ? 'Criar conta' : 'Entrar'}
          </button>
        </p>
      </div>
    </div>
  );
};
