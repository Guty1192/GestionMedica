'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Paciente,
  Ecografia,
  PapanicolauResultado,
  CitaAgenda,
  CierreDiario,
  UserRole,
  EstadoCita,
  MetodoPago,
  RegistroHistorial,
} from '@/types';
import {
  INITIAL_PACIENTES,
  INITIAL_ECOGRAFIAS,
  INITIAL_CITAS,
  INITIAL_PAPS,
  INITIAL_CIERRE_DIARIO,
  INITIAL_HISTORIAL,
} from './mockData';
import { supabase, isSupabaseConfigured } from './client';

interface ClinicContextType {
  // Roles & Viewers
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  activePatientId: string;
  setActivePatientId: (id: string) => void;
  activePatient: Paciente | undefined;

  // Data
  pacientes: Paciente[];
  historial: RegistroHistorial[];
  ecografias: Ecografia[];
  papanicolauList: PapanicolauResultado[];
  citas: CitaAgenda[];
  cierreDiario: CierreDiario;

  // Operational Actions
  addEcografia: (eco: Omit<Ecografia, 'id' | 'created_at'>) => Promise<void>;
  addPaciente: (paciente: Omit<Paciente, 'id' | 'created_at'>) => Promise<Paciente>;
  updatePaciente: (id: string, updates: Partial<Paciente>) => Promise<void>;
  updateDatosPaciente: (
    currentDni: string,
    updatedData: {
      nombre: string;
      documento: string;
      edad: number;
      telefono: string;
      email: string;
      grupo_rh?: string;
      alergias?: string;
      antecedentes_medicos?: string;
    }
  ) => Promise<void>;
  updateCitaEstado: (citaId: string, nuevoEstado: EstadoCita, nuevoMetodoPago?: MetodoPago) => Promise<void>;
  addCita: (cita: Omit<CitaAgenda, 'id' | 'created_at'>) => Promise<void>;
  addPapanicolau: (pap: Omit<PapanicolauResultado, 'id' | 'created_at'>) => Promise<void>;
  addRegistroHistorial: (registro: Omit<RegistroHistorial, 'id' | 'created_at'>) => Promise<RegistroHistorial>;
  updateRegistroHistorial: (id: string, updates: Partial<RegistroHistorial>) => Promise<void>;
  deleteRegistroHistorial: (id: string) => Promise<void>;
  updateCierreDiario: (updates: Partial<CierreDiario>) => Promise<void>;
  cerrarCajaDelDia: (observaciones: string) => Promise<void>;
  resetToInitialData: () => void;

  // Realtime Status
  isLiveSupabase: boolean;
  notification: { message: string; type: 'success' | 'warning' | 'info' } | null;
  dismissNotification: () => void;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PACIENTES: 'sis_medico_pacientes_v2',
  HISTORIAL: 'sis_medico_historial_v2',
  ECOGRAFIAS: 'sis_medico_ecografias_v2',
  CITAS: 'sis_medico_citas_v2',
  PAPS: 'sis_medico_paps_v2',
  CIERRE: 'sis_medico_cierre_v2',
  ROLE: 'sis_medico_role_v2',
  ACTIVE_PATIENT: 'sis_medico_active_pat_v2',
};

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRoleState] = useState<UserRole>('specialist');
  const [activePatientId, setActivePatientIdState] = useState<string>('pac-1793236077657');
  const [pacientes, setPacientes] = useState<Paciente[]>(INITIAL_PACIENTES);
  const [historial, setHistorial] = useState<RegistroHistorial[]>(INITIAL_HISTORIAL);
  const [ecografias, setEcografias] = useState<Ecografia[]>(INITIAL_ECOGRAFIAS);
  const [papanicolauList, setPapanicolauList] = useState<PapanicolauResultado[]>(INITIAL_PAPS);
  const [citas, setCitas] = useState<CitaAgenda[]>(INITIAL_CITAS);
  const [cierreDiario, setCierreDiario] = useState<CierreDiario>(INITIAL_CIERRE_DIARIO);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);
  const [isLiveSupabase, setIsLiveSupabase] = useState<boolean>(false);

  // Initialize from LocalStorage or Supabase
  useEffect(() => {
    const isConfigured = isSupabaseConfigured();
    setIsLiveSupabase(isConfigured);

    // 1. Cargar cache local para visualización instantánea sin demora
    if (typeof window !== 'undefined') {
      try {
        const savedPacientes = localStorage.getItem(STORAGE_KEYS.PACIENTES);
        if (savedPacientes) {
          const parsed = JSON.parse(savedPacientes);
          const hasAnthony = Array.isArray(parsed) && parsed.some((p: Paciente) => p.documento === '72431309');
          if (hasAnthony) {
            setPacientes(parsed);
          } else {
            setPacientes(INITIAL_PACIENTES);
            saveStateToStorage(STORAGE_KEYS.PACIENTES, INITIAL_PACIENTES);
          }
        } else {
          setPacientes(INITIAL_PACIENTES);
        }

        const savedHistorial = localStorage.getItem(STORAGE_KEYS.HISTORIAL);
        if (savedHistorial) {
          const parsedH = JSON.parse(savedHistorial);
          const hasAnthonyH = Array.isArray(parsedH) && parsedH.some((h: RegistroHistorial) => h.dni === '72431309');
          if (hasAnthonyH) {
            setHistorial(parsedH);
          } else {
            setHistorial(INITIAL_HISTORIAL);
            saveStateToStorage(STORAGE_KEYS.HISTORIAL, INITIAL_HISTORIAL);
          }
        } else {
          setHistorial(INITIAL_HISTORIAL);
        }

        const savedEcos = localStorage.getItem(STORAGE_KEYS.ECOGRAFIAS);
        if (savedEcos) setEcografias(JSON.parse(savedEcos));

        const savedCitas = localStorage.getItem(STORAGE_KEYS.CITAS);
        if (savedCitas) setCitas(JSON.parse(savedCitas));

        const savedPaps = localStorage.getItem(STORAGE_KEYS.PAPS);
        if (savedPaps) setPapanicolauList(JSON.parse(savedPaps));

        const savedCierre = localStorage.getItem(STORAGE_KEYS.CIERRE);
        if (savedCierre) setCierreDiario(JSON.parse(savedCierre));

        const savedRole = localStorage.getItem(STORAGE_KEYS.ROLE);
        if (savedRole === 'admin' || savedRole === 'specialist') setUserRoleState(savedRole);

        const savedActivePatient = localStorage.getItem(STORAGE_KEYS.ACTIVE_PATIENT);
        if (savedActivePatient && savedActivePatient !== 'a1b2c3d4-0001-4000-8000-000000000001') {
          setActivePatientIdState(savedActivePatient);
        } else {
          setActivePatientIdState('pac-1793236077657');
        }
      } catch (err) {
        console.error('Error cargando estado local:', err);
      }
    }

    // 2. Si Supabase está conectado, traer datos en vivo desde la nube
    if (isConfigured && supabase) {
      const client = supabase;
      const fetchSupabaseLive = async () => {
        try {
          const [resPacientes, resHistorial, resEcos, resCitas] = await Promise.allSettled([
            client.from('pacientes_ginecologia').select('*').order('created_at', { ascending: false }),
            client.from('historial_clinico_registros').select('*').order('created_at', { ascending: false }),
            client.from('ecografias_archivos').select('*').order('created_at', { ascending: false }),
            client.from('agenda_citas').select('*').order('created_at', { ascending: false }),
          ]);

          if (resPacientes.status === 'fulfilled' && resPacientes.value.data && resPacientes.value.data.length > 0) {
            setPacientes(resPacientes.value.data as Paciente[]);
            saveStateToStorage(STORAGE_KEYS.PACIENTES, resPacientes.value.data);
          }
          if (resHistorial.status === 'fulfilled' && resHistorial.value.data && resHistorial.value.data.length > 0) {
            setHistorial(resHistorial.value.data as RegistroHistorial[]);
            saveStateToStorage(STORAGE_KEYS.HISTORIAL, resHistorial.value.data);
          }
          if (resEcos.status === 'fulfilled' && resEcos.value.data && resEcos.value.data.length > 0) {
            setEcografias(resEcos.value.data as Ecografia[]);
            saveStateToStorage(STORAGE_KEYS.ECOGRAFIAS, resEcos.value.data);
          }
          if (resCitas.status === 'fulfilled' && resCitas.value.data && resCitas.value.data.length > 0) {
            setCitas(resCitas.value.data as CitaAgenda[]);
            saveStateToStorage(STORAGE_KEYS.CITAS, resCitas.value.data);
          }
        } catch (err) {
          console.warn('Conexión Supabase (modo fallback local activo):', err);
        }
      };

      fetchSupabaseLive();
    }
  }, []);

  const saveStateToStorage = (key: string, data: any) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {
        console.error('Storage save error', e);
      }
    }
  };

  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  const dismissNotification = () => setNotification(null);

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.ROLE, role);
    showToast(`Modo cambiado a: ${role === 'admin' ? 'Administrador' : 'Médico Especialista'}`, 'info');
  };

  const setActivePatientId = (id: string) => {
    setActivePatientIdState(id);
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.ACTIVE_PATIENT, id);
    const pat = pacientes.find((p) => p.id === id);
    if (pat) {
      showToast(`Paciente seleccionado: ${pat.nombre}`, 'info');
    }
  };

  const activePatient = pacientes.find((p) => p.id === activePatientId) || pacientes[0];

  // Operational Actions
  const addEcografia = async (ecoData: Omit<Ecografia, 'id' | 'created_at'>) => {
    const newEco: Ecografia = {
      ...ecoData,
      id: `eco-${Date.now()}`,
      created_at: new Date().toISOString(),
      paciente_nombre: pacientes.find((p) => p.id === ecoData.paciente_id)?.nombre || 'Paciente',
    };

    const updated = [newEco, ...ecografias];
    setEcografias(updated);
    saveStateToStorage(STORAGE_KEYS.ECOGRAFIAS, updated);

    if (supabase) {
      try {
        await supabase.from('ecografias_archivos').insert([newEco]);
      } catch (err) {
        console.warn('Supabase remote insert fallback:', err);
      }
    }

    showToast(`Ecografía "${newEco.nombre}" guardada con informe biométrico`, 'success');
  };

  const addPaciente = async (patData: Omit<Paciente, 'id' | 'created_at'>): Promise<Paciente> => {
    const newPat: Paciente = {
      ...patData,
      id: `pac-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    const updated = [newPat, ...pacientes];
    setPacientes(updated);
    saveStateToStorage(STORAGE_KEYS.PACIENTES, updated);
    setActivePatientIdState(newPat.id);

    if (supabase) {
      try {
        await supabase.from('pacientes_ginecologia').insert([newPat]);
      } catch (err) {
        console.warn('Supabase remote insert fallback:', err);
      }
    }

    showToast(`Nuevo paciente registrado: ${newPat.nombre}`, 'success');
    return newPat;
  };

  const updatePaciente = async (id: string, updates: Partial<Paciente>) => {
    const updated = pacientes.map((p) => (p.id === id ? { ...p, ...updates } : p));
    setPacientes(updated);
    saveStateToStorage(STORAGE_KEYS.PACIENTES, updated);

    if (supabase) {
      try {
        await supabase.from('pacientes_ginecologia').update(updates).eq('id', id);
      } catch (err) {
        console.warn('Supabase remote update fallback:', err);
      }
    }

    showToast(`Expediente actualizado correctamente`, 'success');
  };

  const updateDatosPaciente = async (
    currentDni: string,
    updatedData: {
      nombre: string;
      documento: string;
      edad: number;
      telefono: string;
      email: string;
      grupo_rh?: string;
      alergias?: string;
      antecedentes_medicos?: string;
    }
  ) => {
    // 1. Update or create in pacientes
    let updatedPacientes = [...pacientes];
    const existingIndex = updatedPacientes.findIndex((p) => p.documento === currentDni);

    if (existingIndex >= 0) {
      updatedPacientes[existingIndex] = {
        ...updatedPacientes[existingIndex],
        nombre: updatedData.nombre,
        documento: updatedData.documento,
        edad: updatedData.edad,
        telefono: updatedData.telefono,
        email: updatedData.email,
        grupo_rh: updatedData.grupo_rh || updatedPacientes[existingIndex].grupo_rh || 'O+',
        alergias: updatedData.alergias ?? updatedPacientes[existingIndex].alergias,
        antecedentes_medicos: updatedData.antecedentes_medicos ?? updatedPacientes[existingIndex].antecedentes_medicos,
        updated_at: new Date().toISOString(),
      };
    } else {
      updatedPacientes.unshift({
        id: `pac-${Date.now()}`,
        nombre: updatedData.nombre,
        documento: updatedData.documento,
        edad: updatedData.edad,
        telefono: updatedData.telefono,
        email: updatedData.email,
        grupo_rh: updatedData.grupo_rh || 'O+',
        alergias: updatedData.alergias || 'Ninguna conocida',
        antecedentes_medicos: updatedData.antecedentes_medicos || 'Sin antecedentes',
        especialidad_principal: 'Consulta General',
        estado: 'activo',
        created_at: new Date().toISOString(),
      });
    }

    setPacientes(updatedPacientes);
    saveStateToStorage(STORAGE_KEYS.PACIENTES, updatedPacientes);

    // 2. Synchronize all matching treatment records in historial
    const updatedHistorial = historial.map((h) => {
      if (h.dni === currentDni) {
        return {
          ...h,
          dni: updatedData.documento,
          nombres_completos: updatedData.nombre,
          celular: updatedData.telefono,
          correo: updatedData.email,
          edad: updatedData.edad,
        };
      }
      return h;
    });

    setHistorial(updatedHistorial);
    saveStateToStorage(STORAGE_KEYS.HISTORIAL, updatedHistorial);

    showToast(`Datos de ${updatedData.nombre} actualizados con éxito`, 'success');
  };

  const updateCitaEstado = async (citaId: string, nuevoEstado: EstadoCita, nuevoMetodoPago?: MetodoPago) => {
    let citaActualizada: CitaAgenda | undefined;
    const updated = citas.map((c) => {
      if (c.id === citaId) {
        const u = {
          ...c,
          estado: nuevoEstado,
          metodo_pago: nuevoMetodoPago || c.metodo_pago,
        };
        citaActualizada = u;
        return u;
      }
      return c;
    });

    setCitas(updated);
    saveStateToStorage(STORAGE_KEYS.CITAS, updated);

    if (citaActualizada && nuevoEstado === 'completado') {
      const pagoMetodo = nuevoMetodoPago || citaActualizada.metodo_pago;
      if (pagoMetodo !== 'Pendiente') {
        const monto = citaActualizada.monto || 60;
        setCierreDiario((prev) => {
          const updatedCierre: CierreDiario = {
            ...prev,
            total_ingresos: prev.total_ingresos + monto,
            efectivo: pagoMetodo === 'Efectivo' ? prev.efectivo + monto : prev.efectivo,
            tarjeta: pagoMetodo === 'Tarjeta' ? prev.tarjeta + monto : prev.tarjeta,
            transferencia: pagoMetodo === 'Transferencia' ? prev.transferencia + monto : prev.transferencia,
          };
          saveStateToStorage(STORAGE_KEYS.CIERRE, updatedCierre);
          return updatedCierre;
        });
      }
    }

    const labels: Record<EstadoCita, string> = {
      programado: 'Programada',
      en_espera: 'En Sala de Espera',
      en_consulta: 'En Atención Médica',
      completado: 'Atención Finalizada & Cobrada',
      cancelado: 'Cita Cancelada',
      no_asistio: 'Marcado como No Asistió',
    };

    showToast(`Cita actualizada: ${labels[nuevoEstado]}`, nuevoEstado === 'completado' ? 'success' : 'info');
  };

  const addCita = async (citaData: Omit<CitaAgenda, 'id' | 'created_at'>) => {
    const newCita: CitaAgenda = {
      ...citaData,
      id: `cita-${Date.now()}`,
      created_at: new Date().toISOString(),
      paciente: pacientes.find((p) => p.id === citaData.paciente_id),
    };

    const updated = [...citas, newCita];
    setCitas(updated);
    saveStateToStorage(STORAGE_KEYS.CITAS, updated);

    showToast(`Cita agendada para ${newCita.hora_inicio} (${newCita.tipo})`, 'success');
  };

  const addPapanicolau = async (papData: Omit<PapanicolauResultado, 'id' | 'created_at'>) => {
    const newPap: PapanicolauResultado = {
      ...papData,
      id: `pap-${Date.now()}`,
      created_at: new Date().toISOString(),
      paciente_nombre: pacientes.find((p) => p.id === papData.paciente_id)?.nombre || 'Paciente',
    };

    const updated = [newPap, ...papanicolauList];
    setPapanicolauList(updated);
    saveStateToStorage(STORAGE_KEYS.PAPS, updated);

    showToast(`Resultado de citología registrado (${newPap.clasificacion_bethesda})`, newPap.alerta_biopsia ? 'warning' : 'success');
  };

  const addRegistroHistorial = async (registroData: Omit<RegistroHistorial, 'id' | 'created_at'>): Promise<RegistroHistorial> => {
    const newReg: RegistroHistorial = {
      ...registroData,
      id: `hist-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    const updated = [newReg, ...historial];
    setHistorial(updated);
    saveStateToStorage(STORAGE_KEYS.HISTORIAL, updated);

    // Sync to patient directory
    const existingPatient = pacientes.find((p) => p.documento === newReg.dni);
    if (!existingPatient) {
      await addPaciente({
        nombre: newReg.nombres_completos,
        documento: newReg.dni,
        edad: newReg.edad,
        telefono: newReg.celular,
        email: newReg.correo,
        grupo_rh: 'O+',
        alergias: 'Ninguna conocida',
        antecedentes_medicos: 'Atención en ' + newReg.especialidad,
        especialidad_principal: newReg.especialidad,
        estado: 'activo',
      });
    }

    if (supabase) {
      try {
        await supabase.from('historial_clinico_registros').insert([newReg]);
      } catch (err) {
        console.warn('Supabase remote historial insert fallback:', err);
      }
    }

    showToast(`Consulta de ${newReg.especialidad} registrada para ${newReg.nombres_completos}`, 'success');
    return newReg;
  };

  const updateRegistroHistorial = async (id: string, updates: Partial<RegistroHistorial>) => {
    const updated = historial.map((h) => (h.id === id ? { ...h, ...updates } : h));
    setHistorial(updated);
    saveStateToStorage(STORAGE_KEYS.HISTORIAL, updated);

    if (supabase) {
      try {
        await supabase.from('historial_clinico_registros').update(updates).eq('id', id);
      } catch (err) {
        console.warn('Supabase remote historial update fallback:', err);
      }
    }

    showToast('Registro de historial actualizado', 'success');
  };

  const deleteRegistroHistorial = async (id: string) => {
    const updated = historial.filter((h) => h.id !== id);
    setHistorial(updated);
    saveStateToStorage(STORAGE_KEYS.HISTORIAL, updated);

    if (supabase) {
      try {
        await supabase.from('historial_clinico_registros').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase remote historial delete fallback:', err);
      }
    }

    showToast('Registro de historial eliminado', 'info');
  };

  const updateCierreDiario = async (updates: Partial<CierreDiario>) => {
    const updated = { ...cierreDiario, ...updates };
    setCierreDiario(updated);
    saveStateToStorage(STORAGE_KEYS.CIERRE, updated);
  };

  const cerrarCajaDelDia = async (observaciones: string) => {
    const updated: CierreDiario = {
      ...cierreDiario,
      cerrado: true,
      observaciones: observaciones || 'Cierre de caja efectuado con éxito.',
    };
    setCierreDiario(updated);
    saveStateToStorage(STORAGE_KEYS.CIERRE, updated);
    showToast(`Caja del día cerrada exitosamente. Balance: $${updated.total_ingresos.toFixed(2)}`, 'success');
  };

  const resetToInitialData = () => {
    setPacientes(INITIAL_PACIENTES);
    setHistorial(INITIAL_HISTORIAL);
    setEcografias(INITIAL_ECOGRAFIAS);
    setCitas(INITIAL_CITAS);
    setPapanicolauList(INITIAL_PAPS);
    setCierreDiario(INITIAL_CIERRE_DIARIO);
    if (typeof window !== 'undefined') {
      Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    }
    showToast('Datos reiniciados al estado clínico por defecto', 'info');
  };

  return (
    <ClinicContext.Provider
      value={{
        userRole,
        setUserRole,
        activePatientId,
        setActivePatientId,
        activePatient,
        pacientes,
        historial,
        ecografias,
        papanicolauList,
        citas,
        cierreDiario,
        addEcografia,
        addPaciente,
        updatePaciente,
        updateDatosPaciente,
        updateCitaEstado,
        addCita,
        addPapanicolau,
        addRegistroHistorial,
        updateRegistroHistorial,
        deleteRegistroHistorial,
        updateCierreDiario,
        cerrarCajaDelDia,
        resetToInitialData,
        isLiveSupabase,
        notification,
        dismissNotification,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinicStore = (): ClinicContextType => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinicStore must be used within a ClinicProvider');
  }
  return context;
};
