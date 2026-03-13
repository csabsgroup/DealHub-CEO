import { NovoContatoModal } from '@/crm/components/NovoContatoModal';
import { useContatos } from '@/crm/hooks/useContatos';
import { useEmpresas } from '@/crm/hooks/useEmpresas';
import { styled } from '@linaria/react';
import { useMemo, useState } from 'react';
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

const StyledBadge = styled.span`
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

// --------------- Component ---------------

export const ContatosPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: contatos, isLoading, isError } = useContatos();
  const { data: empresas } = useEmpresas();

  // Mapa empresa_id -> nome para exibição rápida
  const empresaMap = useMemo(() => {
    const map = new Map<string, string>();
    empresas?.forEach((emp) => {
      map.set(emp.id, emp.nome_fantasia || emp.razao_social);
    });
    return map;
  }, [empresas]);

  return (
    <StyledPageContainer>
      <StyledPageHeader>
        <StyledPageTitle>Contatos</StyledPageTitle>
        <Button
          variant="primary"
          accent="blue"
          size="medium"
          title="Novo Contato"
          Icon={IconPlus}
          onClick={() => setIsModalOpen(true)}
        />
      </StyledPageHeader>

      <StyledPageBody>
        {isLoading && (
          <StyledLoadingState>Carregando contatos...</StyledLoadingState>
        )}

        {isError && (
          <StyledLoadingState>
            Erro ao carregar contatos. Tente novamente.
          </StyledLoadingState>
        )}

        {!isLoading && !isError && (!contatos || contatos.length === 0) && (
          <StyledEmptyState>
            <StyledEmptyTitle>Nenhum contato cadastrado</StyledEmptyTitle>
            <StyledEmptySubtitle>
              Clique em &quot;Novo Contato&quot; para adicionar o primeiro contato.
            </StyledEmptySubtitle>
            <Button
              variant="secondary"
              accent="blue"
              size="medium"
              title="Novo Contato"
              Icon={IconPlus}
              onClick={() => setIsModalOpen(true)}
            />
          </StyledEmptyState>
        )}

        {!isLoading && !isError && contatos && contatos.length > 0 && (
          <StyledTableWrapper>
            <StyledTable>
              <StyledTHead>
                <tr>
                  <StyledTh>Nome</StyledTh>
                  <StyledTh>E-mail</StyledTh>
                  <StyledTh>Telefone</StyledTh>
                  <StyledTh>Cargo</StyledTh>
                  <StyledTh>Empresa</StyledTh>
                </tr>
              </StyledTHead>
              <tbody>
                {contatos.map((contato) => (
                  <StyledTr key={contato.id}>
                    <StyledTd>
                      <div>
                        <span>{contato.nome}</span>
                        {contato.is_principal && (
                          <span
                            style={{
                              marginLeft: 6,
                              fontSize: 'var(--t-font-size-xs)',
                              color: 'var(--t-color-green)',
                            }}
                          >
                            ★ Principal
                          </span>
                        )}
                      </div>
                    </StyledTd>
                    <StyledTdSecondary>
                      {contato.email || '—'}
                    </StyledTdSecondary>
                    <StyledTdSecondary>
                      {contato.telefone || '—'}
                    </StyledTdSecondary>
                    <StyledTd>
                      {contato.cargo ? (
                        <StyledBadge>{contato.cargo}</StyledBadge>
                      ) : (
                        <StyledTdSecondary as="span">—</StyledTdSecondary>
                      )}
                    </StyledTd>
                    <StyledTd>
                      {contato.empresa_id && empresaMap.has(contato.empresa_id) ? (
                        <StyledBadge>
                          {empresaMap.get(contato.empresa_id)}
                        </StyledBadge>
                      ) : (
                        <StyledTdSecondary as="span">—</StyledTdSecondary>
                      )}
                    </StyledTd>
                  </StyledTr>
                ))}
              </tbody>
            </StyledTable>
          </StyledTableWrapper>
        )}
      </StyledPageBody>

      <NovoContatoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </StyledPageContainer>
  );
};
