import React from 'react';
import CiclosContexto from './CiclosContexto.jsx';
import CursosContexto from './CursosContexto.jsx';
import ModulosContexto from './ModulosContexto.jsx';
import DiscentesContexto from './DiscentesContexto.jsx';
import EvaluacionesContexto from './EvaluacionesContexto.jsx';
import PracticasContexto from './PracticasContexto.jsx';
import RAContexto from './RAContexto.jsx';
import CEContexto from './CEContexto.jsx';
import ImparteContexto from './ImparteContexto.jsx';
import EvaluanContexto from './EvaluanContexto.jsx';
import TrabajanContexto from './TrabajanContexto.jsx';
import CECursoContexto from './CECursoContexto.jsx';
import RACursoContexto from './RACursoContexto.jsx';

// Proveedor compuesto que agrupa todos los proveedores de contexto de mantenimiento de tablas del sistema
const MantenimientoProveedores = ({ children }) => {
  return (
    <CiclosContexto>
      <CursosContexto>
        <ModulosContexto>
          <DiscentesContexto>
            <EvaluacionesContexto>
              <PracticasContexto>
                <RAContexto>
                  <CEContexto>
                    <ImparteContexto>
                      <EvaluanContexto>
                        <TrabajanContexto>
                          <CECursoContexto>
                            <RACursoContexto>
                              {children}
                            </RACursoContexto>
                          </CECursoContexto>
                        </TrabajanContexto>
                      </EvaluanContexto>
                    </ImparteContexto>
                  </CEContexto>
                </RAContexto>
              </PracticasContexto>
            </EvaluacionesContexto>
          </DiscentesContexto>
        </ModulosContexto>
      </CursosContexto>
    </CiclosContexto>
  );
};

export default MantenimientoProveedores;
