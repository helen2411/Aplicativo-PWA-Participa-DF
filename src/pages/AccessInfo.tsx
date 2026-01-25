import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, ExternalLink, FileText, MapPin } from 'lucide-react';
import { useAccessibility } from '../hooks/useAccessibility';

export const AccessInfo = () => {
  const navigate = useNavigate();
  const { isTalkBackEnabled, speak } = useAccessibility();

  const openExternal = (url: string, announce?: string) => {
    if (isTalkBackEnabled && announce) speak(announce);
    window.open(url, '_blank', 'noopener');
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => {
          if (isTalkBackEnabled) speak('Voltando para a tela inicial');
          navigate('/');
        }}
        className="flex items-center text-gray-600 hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-1" />
        Voltar
      </button>

      <div className="flex items-center gap-3">
        <Info className="w-7 h-7 text-primary" />
        <h2 className="text-2xl font-bold text-gray-800">Acesso à Informação</h2>
      </div>
      <p className="text-gray-700">
        O acesso às informações produzidas e armazenadas pelo Estado é um direito do cidadão,
        garantido pela Constituição de 1988 e regulamentado no DF pela Lei Distrital nº 4.990/2012,
        nos termos da Lei Federal nº 12.527/2011 (Lei de Acesso à Informação – LAI).
      </p>
      <p className="text-gray-700">
        Com base na LAI, qualquer pessoa pode solicitar informações ao Estado, conforme os
        procedimentos e prazos previstos, desde que não tenham caráter sigiloso.
      </p>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">Canais de Registro</h3>

        <div className="grid grid-cols-1 gap-3">
          <div className="p-4 bg-white rounded-2xl border border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-primary" />
              <div>
                <div className="font-semibold text-gray-800">Participa DF (SIC)</div>
                <div className="text-sm text-gray-600">
                  Sistema eletrônico do Serviço de Informações ao Cidadão
                </div>
              </div>
            </div>
            <button
              onClick={() =>
                openExternal(
                  'https://www.participa.df.gov.br/static/acesso-informacao',
                  'Abrindo Participa DF, acesso à informação'
                )
              }
              className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:border-primary hover:text-primary transition-colors flex items-center gap-1"
            >
              Acessar <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-primary" />
              <div>
                <div className="font-semibold text-gray-800">Presencial nas Ouvidorias</div>
                <div className="text-sm text-gray-600">
                  Unidades físicas para registro de pedidos de acesso
                </div>
              </div>
            </div>
            <button
              onClick={() =>
                openExternal(
                  'https://www.participa.df.gov.br/static/acesso-informacao',
                  'Abrindo endereços e horários das ouvidorias'
                )
              }
              className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:border-primary hover:text-primary transition-colors flex items-center gap-1"
            >
              Endereços <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">Onde encontrar informações</h3>
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() =>
              openExternal('https://www.transparencia.df.gov.br', 'Abrindo Portal da Transparência')
            }
            className="w-full p-4 bg-white rounded-2xl border border-gray-200 text-left hover:border-primary hover:shadow-sm transition-colors"
          >
            Portal da Transparência do Distrito Federal
          </button>
          <button
            onClick={() => openExternal('https://www.df.gov.br', 'Abrindo Portal do GDF')}
            className="w-full p-4 bg-white rounded-2xl border border-gray-200 text-left hover:border-primary hover:shadow-sm transition-colors"
          >
            Portal do GDF
          </button>
          <button
            onClick={() =>
              openExternal('https://www.dados.df.gov.br', 'Abrindo Portal de Dados Abertos')
            }
            className="w-full p-4 bg-white rounded-2xl border border-gray-200 text-left hover:border-primary hover:shadow-sm transition-colors"
          >
            Portal de Dados Abertos
          </button>
          <button
            onClick={() =>
              openExternal(
                'https://www.participa.df.gov.br/static/acesso-informacao',
                'Abrindo lista de órgãos e entidades'
              )
            }
            className="w-full p-4 bg-white rounded-2xl border border-gray-200 text-left hover:border-primary hover:shadow-sm transition-colors"
          >
            Sites dos órgãos e entidades do GDF
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-gray-800">Perguntas Frequentes</h3>
        <button
          onClick={() =>
            openExternal(
              'https://www.participa.df.gov.br/static/acesso-informacao',
              'Abrindo perguntas frequentes sobre acesso à informação'
            )
          }
          className="px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Acessar FAQ
        </button>
      </div>
    </div>
  );
};

