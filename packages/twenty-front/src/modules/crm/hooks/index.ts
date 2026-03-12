// Barrel export para todos os hooks de CRM
export {
    useCreateEmpresa, useDeleteEmpresa, useEmpresa, useEmpresas, useUpdateEmpresa
} from './useEmpresas';

export {
    useContato, useContatos, useContatosByEmpresa,
    useCreateContato, useDeleteContato, useUpdateContato
} from './useContatos';

export {
    useCreateLead, useCreateOrigemLead, useDeleteLead, useLead, useLeads, useOrigensLead, useUpdateLead, useUpdateOrigemLead
} from './useLeads';

export {
    useCreateMotivoPerda, useCreatePipeline, useCreatePipelineEtapa, useMotivosPerda, usePipeline, usePipelineEtapas, usePipelines, useUpdateMotivoPerda, useUpdatePipeline, useUpdatePipelineEtapa
} from './usePipelines';

export {
    useCreateNegocio, useDeleteNegocio, useNegocio, useNegocios, useNegociosByEmpresa, useNegociosByPipeline, useUpdateNegocio
} from './useNegocios';

export {
    useAtividade, useAtividades, useAtividadesByEmpresa,
    useAtividadesByLead, useAtividadesByNegocio, useCreateAtividade, useDeleteAtividade, useMinhasAtividadesPendentes, useUpdateAtividade
} from './useAtividades';

