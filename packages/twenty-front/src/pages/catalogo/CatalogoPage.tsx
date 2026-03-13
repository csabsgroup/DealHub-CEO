import { NovoPacoteModal } from '@/crm/components/NovoPacoteModal';
import { NovoServicoModal } from '@/crm/components/NovoServicoModal';
import { usePacotes } from '@/crm/hooks/usePacotes';
import { useServicos } from '@/crm/hooks/useServicos';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// --------------- Types ---------------

type TabKey = 'servicos' | 'pacotes';

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

const StyledTabs = styled.div`
  display: flex;
  gap: 0;
  padding: 0 ${themeCssVariables.spacing[8]};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  flex-shrink: 0;
`;

const StyledTab = styled.button<{ active?: boolean }>`
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
  background: transparent;
  border: none;
  border-bottom: 2px solid ${(props) =>
    props.active ? themeCssVariables.accent.primary : 'transparent'};
  color: ${(props) =>
    props.active
      ? themeCssVariables.font.color.primary
      : themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${(props) => (props.active ? '600' : '500')};
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease;

  &:hover {
    color: ${themeCssVariables.font.color.primary};
  }
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

const StyledBadge = styled.span<{ variant?: 'blue' | 'green' | 'orange' | 'gray' }>`
  display: inline-flex;
  align-items: center;
  padding: 2px ${themeCssVariables.spacing[2]};
  border-radius: ${themeCssVariables.border.radius.pill};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: 500;
  white-space: nowrap;
  background: ${(props) => {
    switch (props.variant) {
      case 'green':
        return themeCssVariables.background.transparent.success;
      case 'orange':
        return themeCssVariables.background.transparent.orange;
      case 'gray':
        return themeCssVariables.background.transparent.light;
      default:
        return themeCssVariables.background.transparent.blue;
    }
  }};
  color: ${(props) => {
    switch (props.variant) {
      case 'green':
        return themeCssVariables.color.green;
      case 'orange':
        return themeCssVariables.color.orange;
      case 'gray':
        return themeCssVariables.font.color.secondary;
      default:
        return themeCssVariables.accent.primary;
    }
  }};
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

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// --------------- Component ---------------

export const CatalogoPage = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('servicos');
  const [isServicoModalOpen, setIsServicoModalOpen] = useState(false);
  const [isPacoteModalOpen, setIsPacoteModalOpen] = useState(false);

  const {
    data: servicos,
    isLoading: loadingServicos,
    isError: errorServicos,
  } = useServicos();

  const {
    data: pacotes,
    isLoading: loadingPacotes,
    isError: errorPacotes,
  } = usePacotes();

  const handleAdd = () => {
    if (activeTab === 'servicos') {
      setIsServicoModalOpen(true);
    } else {
      setIsPacoteModalOpen(true);
    }
  };

  // --------------- Render Serviços ---------------

  const renderServicos = () => {
    if (loadingServicos) {
      return <StyledLoadingState>Carregando serviços...</StyledLoadingState>;
    }
    if (errorServicos) {
      return <StyledLoadingState>Erro ao carregar serviços.</StyledLoadingState>;
    }

    const items = servicos ?? [];

    if (items.length === 0) {
      return (
        <StyledEmptyState>
          <StyledEmptyTitle>Nenhum serviço cadastrado</StyledEmptyTitle>
          <StyledEmptySubtitle>
            Monte seu catálogo de serviços contábeis para usar nas propostas.
          </StyledEmptySubtitle>
          <Button
            variant="secondary"
            accent="blue"
            size="medium"
            title="Cadastrar Primeiro Serviço"
            Icon={IconPlus}
            onClick={() => setIsServicoModalOpen(true)}
          />
        </StyledEmptyState>
      );
    }

    return (
      <StyledTableWrapper>
        <StyledTable>
          <StyledTHead>
            <tr>
              <StyledTh>Nome</StyledTh>
              <StyledTh>Categoria</StyledTh>
              <StyledTh>Tipo</StyledTh>
              <StyledTh>Preço Mínimo</StyledTh>
              <StyledTh>Preço Sugerido</StyledTh>
              <StyledTh>Status</StyledTh>
            </tr>
          </StyledTHead>
          <tbody>
            {items.map((servico) => (
              <StyledTr key={servico.id}>
                <StyledTd>{servico.nome}</StyledTd>
                <StyledTdSecondary>
                  {servico.categoria ?? '—'}
                </StyledTdSecondary>
                <StyledTd>
                  <StyledBadge
                    variant={servico.tipo_cobranca === 'Recorrente' ? 'blue' : 'orange'}
                  >
                    {servico.tipo_cobranca}
                  </StyledBadge>
                </StyledTd>
                <StyledTdSecondary>
                  {formatCurrency(servico.preco_minimo)}
                </StyledTdSecondary>
                <StyledTd>{formatCurrency(servico.preco_sugerido)}</StyledTd>
                <StyledTd>
                  <StyledBadge variant={servico.is_active ? 'green' : 'gray'}>
                    {servico.is_active ? 'Ativo' : 'Inativo'}
                  </StyledBadge>
                </StyledTd>
              </StyledTr>
            ))}
          </tbody>
        </StyledTable>
      </StyledTableWrapper>
    );
  };

  // --------------- Render Pacotes ---------------

  const renderPacotes = () => {
    if (loadingPacotes) {
      return <StyledLoadingState>Carregando pacotes...</StyledLoadingState>;
    }
    if (errorPacotes) {
      return <StyledLoadingState>Erro ao carregar pacotes.</StyledLoadingState>;
    }

    const items = pacotes ?? [];

    if (items.length === 0) {
      return (
        <StyledEmptyState>
          <StyledEmptyTitle>Nenhum pacote cadastrado</StyledEmptyTitle>
          <StyledEmptySubtitle>
            Crie pacotes agrupando serviços para agilizar suas propostas.
          </StyledEmptySubtitle>
          <Button
            variant="secondary"
            accent="blue"
            size="medium"
            title="Cadastrar Primeiro Pacote"
            Icon={IconPlus}
            onClick={() => setIsPacoteModalOpen(true)}
          />
        </StyledEmptyState>
      );
    }

    return (
      <StyledTableWrapper>
        <StyledTable>
          <StyledTHead>
            <tr>
              <StyledTh>Nome</StyledTh>
              <StyledTh>Descrição</StyledTh>
              <StyledTh>Preço Sugerido</StyledTh>
              <StyledTh>Status</StyledTh>
            </tr>
          </StyledTHead>
          <tbody>
            {items.map((pacote) => (
              <StyledTr key={pacote.id}>
                <StyledTd>{pacote.nome}</StyledTd>
                <StyledTdSecondary>
                  {pacote.descricao ?? '—'}
                </StyledTdSecondary>
                <StyledTd>{formatCurrency(pacote.preco_sugerido)}</StyledTd>
                <StyledTd>
                  <StyledBadge variant={pacote.is_active ? 'green' : 'gray'}>
                    {pacote.is_active ? 'Ativo' : 'Inativo'}
                  </StyledBadge>
                </StyledTd>
              </StyledTr>
            ))}
          </tbody>
        </StyledTable>
      </StyledTableWrapper>
    );
  };

  // --------------- Main Render ---------------

  return (
    <StyledPageContainer>
      <StyledPageHeader>
        <StyledPageTitle>Catálogo</StyledPageTitle>
        <Button
          variant="primary"
          accent="blue"
          size="medium"
          title={activeTab === 'servicos' ? 'Novo Serviço' : 'Novo Pacote'}
          Icon={IconPlus}
          onClick={handleAdd}
        />
      </StyledPageHeader>

      <StyledTabs>
        <StyledTab
          active={activeTab === 'servicos'}
          onClick={() => setActiveTab('servicos')}
        >
          Serviços {servicos?.length ? `(${servicos.length})` : ''}
        </StyledTab>
        <StyledTab
          active={activeTab === 'pacotes'}
          onClick={() => setActiveTab('pacotes')}
        >
          Pacotes {pacotes?.length ? `(${pacotes.length})` : ''}
        </StyledTab>
      </StyledTabs>

      <StyledPageBody>
        {activeTab === 'servicos' ? renderServicos() : renderPacotes()}
      </StyledPageBody>

      <NovoServicoModal
        isOpen={isServicoModalOpen}
        onClose={() => setIsServicoModalOpen(false)}
      />
      <NovoPacoteModal
        isOpen={isPacoteModalOpen}
        onClose={() => setIsPacoteModalOpen(false)}
      />
    </StyledPageContainer>
  );
};
