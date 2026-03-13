import { styled } from '@linaria/react';
import { IconTrash } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Modal, ModalContent, ModalFooter, ModalHeader } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// --------------- Types ---------------

type ConfirmDeleteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending?: boolean;
  entityName?: string;
  entityLabel?: string;
};

// --------------- Styled Components ---------------

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: 600;
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledBody = styled.div`
  padding: ${themeCssVariables.spacing[4]} 0;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledMessage = styled.p`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
  line-height: 1.5;
`;

const StyledWarning = styled.p`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.tertiary};
  margin: 0;
`;

const StyledFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledIconWrapper = styled.span`
  color: ${themeCssVariables.font.color.danger};
  display: inline-flex;
`;

// --------------- Component ---------------

export const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  isPending = false,
  entityName = 'registro',
  entityLabel,
}: ConfirmDeleteModalProps) => {
  return (
    <Modal isOpen={isOpen} size="small" onBackdropMouseDown={onClose}>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div onMouseDown={(e) => e.stopPropagation()}>
        <ModalHeader>
          <StyledTitle>
            <StyledIconWrapper>
              <IconTrash size={20} />
            </StyledIconWrapper>
            Excluir {entityName}
          </StyledTitle>
        </ModalHeader>

        <ModalContent>
          <StyledBody>
            <StyledMessage>
              Tem certeza que deseja excluir{' '}
              {entityLabel ? (
                <strong>{entityLabel}</strong>
              ) : (
                `este ${entityName}`
              )}
              ?
            </StyledMessage>
            <StyledWarning>Esta ação não pode ser desfeita.</StyledWarning>
          </StyledBody>
        </ModalContent>

        <ModalFooter>
          <StyledFooter>
            <Button
              variant="secondary"
              accent="default"
              size="medium"
              title="Cancelar"
              onClick={onClose}
              type="button"
            />
            <Button
              variant="primary"
              accent="danger"
              size="medium"
              title="Excluir"
              Icon={IconTrash}
              isLoading={isPending}
              type="button"
              onClick={onConfirm}
            />
          </StyledFooter>
        </ModalFooter>
      </div>
    </Modal>
  );
};
