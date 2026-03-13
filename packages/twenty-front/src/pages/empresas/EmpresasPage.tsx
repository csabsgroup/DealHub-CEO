import { NovaEmpresaModal } from '@/crm/components/NovaEmpresaModal';
import { useEmpresas } from '@/crm/hooks/useEmpresas';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// --------------- Styled Components ---------------

const StyledPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const StyledPageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[8]};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  flex-shrink: 0;
`;

const StyledPageTitle = styled.h1`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: 600;
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledPageBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[8]};
`;

const StyledTableWrapper = styled.div`
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  overflow: hidden;
  background: ${themeCssVariables.background.primary};
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const StyledTHead = styled.thead`
  background: ${themeCssVariables.background.secondary};
`;

const StyledTh = styled.th`
  text-align: left;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: 600;
  color: ${themeCssVariables.font.color.secondary};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  white-space: nowrap;
`;

const StyledTr = styled.tr`
  transition: background 0.1s ease;

  &:not(:last-child) {
    border-bottom: 1px solid ${themeCssVariables.border.color.light};
  }

  &:hover {
    background: ${themeCssVariables.background.secondary};
  }
`;

const StyledTd = styled.td`
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.primary};
  vertical-align: middle;
`;

const StyledTdSecondary = styled(StyledTd)`
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledBadge = styled.span<{ regime?: string }>`
  display: inline-flex;
  align-items: center;
  padding: 2px ${themeCssVariables.spacing[2]};
  border-radius: ${themeCssVariables.border.radius.pill};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: 500;
  background: ${themeCssVariables.background.transparent.blue};
  color: ${themeCssVariables.accent.primary};
  white-space: nowrap;
`;

const StyledEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${themeCssVariables.spacing[16]};
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledEmptyTitle = styled.p`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: 500;
  color: ${themeCssVariables.font.color.secondary};
  margin: 0;
`;

const StyledEmptySubtitle = styled.p`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
  margin: 0;
  text-align: center;
`;

const StyledLoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${themeCssVariables.spacing[16]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

// --------------- Helpers ---------------

const formatCNPJ = (cnpj: string | null): string => {
  if (!cnpj) return '—';
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14) return cnpj;
  return digits.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5',
  );
};

const formatFaturamento = (value: number | null): string => {
  if (value === null) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
};

// --------------- Component ---------------

export const EmpresasPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: empresas, isLoading, isError } = useEmpresas();

  return (
    <StyledPageContainer>
      <StyledPageHeader>
        <StyledPageTitle>Empresas</StyledPageTitle>
        <Button
          variant="primary"
          accent="blue"
          size="medium"
          title="Nova Empresa"
          Icon={IconPlus}
          onClick={() => setIsModalOpen(true)}
        />
      </StyledPageHeader>

      <StyledPageBody>
        {isLoading && (
          <StyledLoadingState>Carregando empresas...</StyledLoadingState>
        )}

        {isError && (
          <StyledLoadingState>
            Erro ao carregar empresas. Tente novamente.
          </StyledLoadingState>
        )}

        {!isLoading && !isError && (!empresas || empresas.length === 0) && (
          <StyledEmptyState>
            <StyledEmptyTitle>Nenhuma empresa cadastrada</StyledEmptyTitle>
            <StyledEmptySubtitle>
              Clique em "Nova Empresa" para adicionar seu primeiro cliente.
            </StyledEmptySubtitle>
            <Button
              variant="secondary"
              accent="blue"
              size="medium"
              title="Nova Empresa"
              Icon={IconPlus}
              onClick={() => setIsModalOpen(true)}
            />
          </StyledEmptyState>
        )}

        {!isLoading && !isError && empresas && empresas.length > 0 && (
          <StyledTableWrapper>
            <StyledTable>
              <StyledTHead>
                <tr>
                  <StyledTh>Razão Social</StyledTh>
                  <StyledTh>CNPJ</StyledTh>
                  <StyledTh>Regime Tributário</StyledTh>
                  <StyledTh>Faturamento Estimado</StyledTh>
                </tr>
              </StyledTHead>
              <tbody>
                {empresas.map((empresa) => (
                  <StyledTr key={empresa.id}>
                    <StyledTd>
                      <div>
                        <span>{empresa.razao_social}</span>
                        {empresa.nome_fantasia && (
                          <div
                            style={{
                              fontSize: 'var(--t-font-size-xs)',
                              color: 'var(--t-font-color-tertiary)',
                              marginTop: 2,
                            }}
                          >
                            {empresa.nome_fantasia}
                          </div>
                        )}
                      </div>
                    </StyledTd>
                    <StyledTdSecondary>
                      {formatCNPJ(empresa.cnpj)}
                    </StyledTdSecondary>
                    <StyledTd>
                      {empresa.regime_tributario ? (
                        <StyledBadge>{empresa.regime_tributario}</StyledBadge>
                      ) : (
                        <StyledTdSecondary as="span">—</StyledTdSecondary>
                      )}
                    </StyledTd>
                    <StyledTdSecondary>
                      {formatFaturamento(empresa.faturamento_estimado)}
                    </StyledTdSecondary>
                  </StyledTr>
                ))}
              </tbody>
            </StyledTable>
          </StyledTableWrapper>
        )}
      </StyledPageBody>

      <NovaEmpresaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </StyledPageContainer>
  );
};
