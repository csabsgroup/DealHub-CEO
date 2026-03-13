import { useCreateEmpresa } from '@/crm/hooks/useEmpresas';
import { styled } from '@linaria/react';
import { useRef, useState } from 'react';
import { Button } from 'twenty-ui/input';
import { Modal, ModalContent, ModalFooter, ModalHeader } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// --------------- Types ---------------

type NovaEmpresaModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type EmpresaFormData = {
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  regime_tributario: string;
  segmento: string;
  faturamento_estimado: string;
};

const EMPTY_FORM: EmpresaFormData = {
  razao_social: '',
  nome_fantasia: '',
  cnpj: '',
  regime_tributario: '',
  segmento: '',
  faturamento_estimado: '',
};

const REGIMES_TRIBUTARIOS = [
  'Simples Nacional',
  'Lucro Presumido',
  'Lucro Real',
  'Imune/Isento',
];

// --------------- Styled Components ---------------

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: 600;
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[4]} 0;
`;

const StyledFieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledField = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledLabel = styled.label`
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: 500;
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledRequired = styled.span`
  color: ${themeCssVariables.font.color.danger};
  margin-left: 2px;
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
  transition: border-color 0.15s ease;
  width: 100%;
  box-sizing: border-box;

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
  transition: border-color 0.15s ease;
  width: 100%;
  box-sizing: border-box;
  cursor: pointer;

  &:focus {
    border-color: ${themeCssVariables.accent.primary};
  }
`;

const StyledFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledErrorMessage = styled.p`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.danger};
  margin: 0;
`;

// --------------- Component ---------------

export const NovaEmpresaModal = ({ isOpen, onClose }: NovaEmpresaModalProps) => {
  const [formData, setFormData] = useState<EmpresaFormData>(EMPTY_FORM);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const { mutateAsync: createEmpresa, isPending } = useCreateEmpresa();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage(null);
  };

  const handleClose = () => {
    setFormData(EMPTY_FORM);
    setErrorMessage(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.razao_social.trim()) {
      setErrorMessage('Razão Social é obrigatório.');
      return;
    }

    try {
      await createEmpresa({
        razao_social: formData.razao_social.trim(),
        nome_fantasia: formData.nome_fantasia.trim() || null,
        cnpj: formData.cnpj.trim() || null,
        regime_tributario:
          (formData.regime_tributario as
            | 'Simples Nacional'
            | 'Lucro Presumido'
            | 'Lucro Real'
            | 'Imune/Isento') || null,
        segmento: formData.segmento.trim() || null,
        faturamento_estimado: formData.faturamento_estimado
          ? Number(formData.faturamento_estimado)
          : null,
        tags: [],
      });

      handleClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar empresa.';
      setErrorMessage(message);
    }
  };

  return (
    <Modal isOpen={isOpen} size="medium" onBackdropMouseDown={handleClose}>
      <ModalHeader>
        <StyledTitle>Nova Empresa</StyledTitle>
      </ModalHeader>

      <ModalContent>
        <StyledForm onSubmit={handleSubmit} id="nova-empresa-form" ref={formRef}>
          {/* Razão Social - full width */}
          <StyledFieldGroup>
            <StyledLabel htmlFor="razao_social">
              Razão Social<StyledRequired>*</StyledRequired>
            </StyledLabel>
            <StyledInput
              id="razao_social"
              name="razao_social"
              type="text"
              placeholder="Ex: Empresa ABC Ltda"
              value={formData.razao_social}
              onChange={handleChange}
              autoFocus
            />
          </StyledFieldGroup>

          {/* Nome Fantasia + CNPJ */}
          <StyledField>
            <StyledFieldGroup>
              <StyledLabel htmlFor="nome_fantasia">Nome Fantasia</StyledLabel>
              <StyledInput
                id="nome_fantasia"
                name="nome_fantasia"
                type="text"
                placeholder="Ex: Empresa ABC"
                value={formData.nome_fantasia}
                onChange={handleChange}
              />
            </StyledFieldGroup>

            <StyledFieldGroup>
              <StyledLabel htmlFor="cnpj">CNPJ</StyledLabel>
              <StyledInput
                id="cnpj"
                name="cnpj"
                type="text"
                placeholder="00.000.000/0001-00"
                value={formData.cnpj}
                onChange={handleChange}
              />
            </StyledFieldGroup>
          </StyledField>

          {/* Regime Tributário + Segmento */}
          <StyledField>
            <StyledFieldGroup>
              <StyledLabel htmlFor="regime_tributario">
                Regime Tributário
              </StyledLabel>
              <StyledSelect
                id="regime_tributario"
                name="regime_tributario"
                value={formData.regime_tributario}
                onChange={handleChange}
              >
                <option value="">Selecione...</option>
                {REGIMES_TRIBUTARIOS.map((regime) => (
                  <option key={regime} value={regime}>
                    {regime}
                  </option>
                ))}
              </StyledSelect>
            </StyledFieldGroup>

            <StyledFieldGroup>
              <StyledLabel htmlFor="segmento">Segmento</StyledLabel>
              <StyledInput
                id="segmento"
                name="segmento"
                type="text"
                placeholder="Ex: Comércio, Serviços..."
                value={formData.segmento}
                onChange={handleChange}
              />
            </StyledFieldGroup>
          </StyledField>

          {errorMessage && (
            <StyledErrorMessage>{errorMessage}</StyledErrorMessage>
          )}
        </StyledForm>
      </ModalContent>

      <ModalFooter>
        <StyledFooter>
          <Button
            variant="secondary"
            accent="default"
            size="medium"
            title="Cancelar"
            onClick={handleClose}
            type="button"
          />
          <Button
            variant="primary"
            accent="blue"
            size="medium"
            title="Salvar Empresa"
            isLoading={isPending}
            type="button"
            onClick={() => formRef.current?.requestSubmit()}
          />
        </StyledFooter>
      </ModalFooter>
    </Modal>
  );
};
