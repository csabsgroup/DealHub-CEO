import { useAuthContext } from '@/auth/hooks/useAuthContext';
import { useTenant } from '@/auth/hooks/useTenant';
import { styled } from '@linaria/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { IconCheck } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { supabase } from '~/lib/supabase';

// --------------- Styled Components ---------------

const StyledPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const StyledPageHeader = styled.div`
  padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[8]};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  flex-shrink: 0;
`;

const StyledPageTitle = styled.h1`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: 600;
  color: ${themeCssVariables.font.color.primary};
  margin: 0 0 ${themeCssVariables.spacing[1]};
`;

const StyledPageSubtitle = styled.p`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
  margin: 0;
`;

const StyledPageBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[8]};
`;

const StyledCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  padding: ${themeCssVariables.spacing[6]};
  max-width: 560px;
`;

const StyledCardTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: 600;
  color: ${themeCssVariables.font.color.primary};
  margin: 0 0 ${themeCssVariables.spacing[5]};
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledLabel = styled.label`
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: 500;
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledInput = styled.input`
  height: 36px;
  padding: 0 ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  background: ${themeCssVariables.background.primary};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  outline: none;
  width: 100%;
  box-sizing: border-box;
  font-family: inherit;

  &:focus {
    border-color: ${themeCssVariables.accent.primary};
  }

  &::placeholder {
    color: ${themeCssVariables.font.color.tertiary};
  }
`;

const StyledSelect = styled.select`
  height: 36px;
  padding: 0 ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  background: ${themeCssVariables.background.primary};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  outline: none;
  width: 100%;
  cursor: pointer;

  &:focus {
    border-color: ${themeCssVariables.accent.primary};
  }
`;

const StyledActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledSavedMessage = styled.span`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[1]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.snackBar.success.color};
  font-weight: 500;
`;

const StyledErrorMessage = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.danger};
`;

const StyledSaveButton = styled.button`
  display: inline-flex;
  align-items: center;
  padding: 0 ${themeCssVariables.spacing[4]};
  height: 36px;
  border-radius: ${themeCssVariables.border.radius.sm};
  border: none;
  background: ${themeCssVariables.accent.primary};
  color: ${themeCssVariables.font.color.inverted};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:hover:not(:disabled) {
    opacity: 0.85;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// --------------- Component ---------------

export const WorkspaceConfigPage = () => {
  const { activeTenant, isLoading: authLoading } = useAuthContext();
  const { tenantId } = useTenant();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    name: '',
    cnpj: '',
    timezone: 'America/Sao_Paulo',
    language: 'pt-BR',
  });
  const [saved, setSaved] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Sincroniza form com dados do tenant quando carregam
  if (activeTenant && !initialized) {
    setForm({
      name: activeTenant.name ?? '',
      cnpj: activeTenant.cnpj ?? '',
      timezone: activeTenant.timezone ?? 'America/Sao_Paulo',
      language: activeTenant.language ?? 'pt-BR',
    });
    setInitialized(true);
  }

  if (authLoading) {
    return (
      <StyledPageContainer>
        <StyledPageHeader>
          <StyledPageTitle>Workspace</StyledPageTitle>
          <StyledPageSubtitle>Carregando...</StyledPageSubtitle>
        </StyledPageHeader>
      </StyledPageContainer>
    );
  }

  const mutation = useMutation({
    mutationFn: async (data: typeof form) => {
      if (!tenantId) throw new Error('Tenant não encontrado');
      const { error } = await supabase
        .from('tenants')
        .update(data)
        .eq('id', tenantId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const handleChange =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <StyledPageContainer>
      <StyledPageHeader>
        <StyledPageTitle>Workspace</StyledPageTitle>
        <StyledPageSubtitle>
          Configure as informações básicas do seu escritório
        </StyledPageSubtitle>
      </StyledPageHeader>

      <StyledPageBody>
        <StyledCard>
          <StyledCardTitle>Dados do Escritório</StyledCardTitle>
          <StyledForm onSubmit={handleSubmit}>
            <StyledField>
              <StyledLabel>Nome do Escritório</StyledLabel>
              <StyledInput
                value={form.name}
                onChange={handleChange('name')}
                placeholder="Ex: Contábil Exemplo Ltda"
              />
            </StyledField>

            <StyledField>
              <StyledLabel>CNPJ</StyledLabel>
              <StyledInput
                value={form.cnpj}
                onChange={handleChange('cnpj')}
                placeholder="00.000.000/0000-00"
              />
            </StyledField>

            <StyledField>
              <StyledLabel>Fuso Horário</StyledLabel>
              <StyledSelect
                value={form.timezone}
                onChange={handleChange('timezone')}
              >
                <option value="America/Sao_Paulo">
                  América/São Paulo (BRT -3)
                </option>
                <option value="America/Manaus">
                  América/Manaus (AMT -4)
                </option>
                <option value="America/Belem">
                  América/Belém (BRT -3)
                </option>
                <option value="America/Fortaleza">
                  América/Fortaleza (BRT -3)
                </option>
                <option value="America/Recife">
                  América/Recife (BRT -3)
                </option>
                <option value="America/Noronha">
                  América/Noronha (FNT -2)
                </option>
              </StyledSelect>
            </StyledField>

            <StyledField>
              <StyledLabel>Idioma</StyledLabel>
              <StyledSelect
                value={form.language}
                onChange={handleChange('language')}
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
                <option value="es-ES">Español</option>
              </StyledSelect>
            </StyledField>

            <StyledActions>
              <span>
                {saved && (
                  <StyledSavedMessage>
                    <IconCheck size={14} />
                    Salvo com sucesso!
                  </StyledSavedMessage>
                )}
                {mutation.isError && (
                  <StyledErrorMessage>
                    Erro ao salvar. Tente novamente.
                  </StyledErrorMessage>
                )}
              </span>
              <StyledSaveButton type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </StyledSaveButton>
            </StyledActions>
          </StyledForm>
        </StyledCard>
      </StyledPageBody>
    </StyledPageContainer>
  );
};
