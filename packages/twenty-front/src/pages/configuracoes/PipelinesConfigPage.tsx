import { styled } from '@linaria/react';
import { IconLayoutKanban } from 'twenty-ui/display';
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

const StyledHeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledPageTitle = styled.h1`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: 600;
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
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

const StyledPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[12]};
  border: 2px dashed ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.secondary};
  text-align: center;
`;

const StyledPlaceholderIcon = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledPlaceholderTitle = styled.h3`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: 600;
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledPlaceholderText = styled.p`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
  margin: 0;
  max-width: 360px;
  line-height: 1.5;
`;

const StyledPipelineList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  max-width: 640px;
`;

const StyledPipelineCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[4]};
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
`;

const StyledPipelineInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledPipelineName = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: 600;
  color: ${themeCssVariables.font.color.primary};
`;

const StyledPipelineDetail = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledComingSoonBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px ${themeCssVariables.spacing[2]};
  border-radius: 999px;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: 500;
  background: color-mix(
    in srgb,
    ${themeCssVariables.accent.primary} 15%,
    transparent
  );
  color: ${themeCssVariables.accent.primary};
`;

// Example pipeline data (static, for structural preview)
const EXAMPLE_PIPELINES = [
  {
    id: '1',
    nome: 'Pipeline Comercial Padrão',
    etapas: 5,
    isDefault: true,
  },
];

// --------------- Component ---------------

export const PipelinesConfigPage = () => {
  return (
    <StyledPageContainer>
      <StyledPageHeader>
        <StyledHeaderText>
          <StyledPageTitle>Pipelines e Etapas</StyledPageTitle>
          <StyledPageSubtitle>
            Gerencie seus funis de vendas e as etapas de cada pipeline
          </StyledPageSubtitle>
        </StyledHeaderText>
      </StyledPageHeader>

      <StyledPageBody>
        <StyledPipelineList>
          {EXAMPLE_PIPELINES.map((pipeline) => (
            <StyledPipelineCard key={pipeline.id}>
              <StyledPipelineInfo>
                <StyledPipelineName>
                  {pipeline.nome}
                  {pipeline.isDefault && (
                    <>
                      {' '}
                      <StyledComingSoonBadge>Padrão</StyledComingSoonBadge>
                    </>
                  )}
                </StyledPipelineName>
                <StyledPipelineDetail>
                  {pipeline.etapas} etapas configuradas
                </StyledPipelineDetail>
              </StyledPipelineInfo>
              <StyledComingSoonBadge>Em breve</StyledComingSoonBadge>
            </StyledPipelineCard>
          ))}
        </StyledPipelineList>

        <StyledPlaceholder style={{ marginTop: '24px' }}>
          <StyledPlaceholderIcon>
            <IconLayoutKanban size={40} />
          </StyledPlaceholderIcon>
          <StyledPlaceholderTitle>
            Gerenciamento completo em breve
          </StyledPlaceholderTitle>
          <StyledPlaceholderText>
            Em breve você poderá criar múltiplos pipelines, renomear etapas,
            definir probabilidades e personalizar o fluxo comercial do seu
            escritório.
          </StyledPlaceholderText>
        </StyledPlaceholder>
      </StyledPageBody>
    </StyledPageContainer>
  );
};
