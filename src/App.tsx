import React, { useState, useEffect, useMemo } from 'react';
import {
  Dumbbell,
  BookOpen,
  GraduationCap,
  Wrench,
  Droplets,
  Flame,
  Trophy,
  CheckCircle2,
  Plus,
  Trash2,
  Edit3,
  RotateCcw,
  Calendar,
  TrendingUp,
  Sparkles,
  Check,
  X,
  Award,
  BarChart3,
  Filter,
  ChevronRight,
  Target,
  Zap
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';

// Definición de categorías con sus estilos e íconos correspondientes
const CATEGORIES = {
  entrenamiento: {
    id: 'entrenamiento',
    name: 'Entrenamiento / Calistenia',
    shortName: 'Calistenia',
    icon: Dumbbell,
    color: '#10b981', // Emerald 500
    bgLight: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    badgeBg: 'bg-emerald-950/80'
  },
  lectura: {
    id: 'lectura',
    name: 'Lectura',
    shortName: 'Lectura',
    icon: BookOpen,
    color: '#8b5cf6', // Violet 500
    bgLight: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    text: 'text-violet-400',
    badgeBg: 'bg-violet-950/80'
  },
  estudio: {
    id: 'estudio',
    name: 'Estudio',
    shortName: 'Estudio',
    icon: GraduationCap,
    color: '#f59e0b', // Amber 500
    bgLight: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    badgeBg: 'bg-amber-950/80'
  },
  proyectos: {
    id: 'proyectos',
    name: 'Proyectos / Taller',
    shortName: 'Taller',
    icon: Wrench,
    color: '#ec4899', // Pink 500
    bgLight: 'bg-pink-500/10',
    border: 'border-pink-500/30',
    text: 'text-pink-400',
    badgeBg: 'bg-pink-950/80'
  },
  hidratacion: {
    id: 'hidratacion',
    name: 'Hidratación',
    shortName: 'Hidratación',
    icon: Droplets,
    color: '#06b6d4', // Cyan 500
    bgLight: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    text: 'text-cyan-400',
    badgeBg: 'bg-cyan-950/80'
  }
};

const DAYS_OF_WEEK = [
  { short: 'Lun', full: 'Lunes', index: 0 },
  { short: 'Mar', full: 'Martes', index: 1 },
  { short: 'Mié', full: 'Miércoles', index: 2 },
  { short: 'Jue', full: 'Jueves', index: 3 },
  { short: 'Vie', full: 'Viernes', index: 4 },
  { short: 'Sáb', full: 'Sábado', index: 5 },
  { short: 'Dom', full: 'Domingo', index: 6 }
];

// Datos iniciales ricos para que el dashboard luzca completo desde el primer uso
const INITIAL_HABITS = [
  {
    id: 'hab-1',
    name: 'Rutina de Calistenia & Dominadas',
    description: '45 min de progresiones de fuerza y control corporal',
    category: 'entrenamiento',
    targetDays: 5,
    completedDays: [true, true, true, false, true, true, false],
    historicalStreak: 12 // Días acumulados previos a esta semana
  },
  {
    id: 'hab-2',
    name: 'Lectura Técnica o Filosófica',
    description: 'Leer mínimo 25 páginas sin distracciones',
    category: 'lectura',
    targetDays: 7,
    completedDays: [true, true, true, true, true, false, true],
    historicalStreak: 18
  },
  {
    id: 'hab-3',
    name: 'Estudio Profundo (Deep Work)',
    description: '2 bloques Pomodoro de arquitectura de software o idiomas',
    category: 'estudio',
    targetDays: 5,
    completedDays: [true, false, true, true, true, false, false],
    historicalStreak: 5
  },
  {
    id: 'hab-4',
    name: 'Avance en Proyecto / Taller',
    description: 'Dedicar 1 hora a prototipado, código o armado en taller',
    category: 'proyectos',
    targetDays: 4,
    completedDays: [false, true, true, true, false, true, true],
    historicalStreak: 8
  },
  {
    id: 'hab-5',
    name: 'Meta de Hidratación (3 Litros)',
    description: 'Beber agua constantemente durante toda la jornada',
    category: 'hidratacion',
    targetDays: 7,
    completedDays: [true, true, true, true, true, true, false],
    historicalStreak: 21
  }
];

const STORAGE_KEY = 'zenith_habit_tracker_v1';

// Función para calcular la racha más larga dentro de la semana y la racha actual activa
const calculateStreaks = (completedDays, todayIndex) => {
  let maxWeeklyStreak = 0;
  let currentRun = 0;

  for (let i = 0; i < completedDays.length; i++) {
    if (completedDays[i]) {
      currentRun++;
      if (currentRun > maxWeeklyStreak) {
        maxWeeklyStreak = currentRun;
      }
    } else {
      currentRun = 0;
    }
  }

  // Calcular racha activa contando hacia atrás desde el día seleccionado como "Hoy"
  // (Si hoy aún no está marcado, verificamos desde ayer para no romper la ilusión antes de que acabe el día)
  let activeStreak = 0;
  let checkIndex = completedDays[todayIndex] ? todayIndex : todayIndex - 1;
  while (checkIndex >= 0 && completedDays[checkIndex]) {
    activeStreak++;
    checkIndex--;
  }

  return { maxWeeklyStreak, activeStreak };
};

export default function App() {
  // Obtener el índice del día actual real (0 = Lunes, 6 = Domingo)
  const getRealTodayIndex = () => {
    const jsDay = new Date().getDay(); // 0 es Domingo en JS
    return jsDay === 0 ? 6 : jsDay - 1;
  };

  // Estados principales
  const [habits, setHabits] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error leyendo localStorage:', e);
    }
    return INITIAL_HABITS;
  });

  const [selectedDayIndex, setSelectedDayIndex] = useState(getRealTodayIndex);
  const [categoryFilter, setCategoryFilter] = useState('todas');
  
  // Estados para modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    type: 'danger',
    onConfirm: () => {}
  });

  // Estado del formulario de crear/editar hábito
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'entrenamiento',
    targetDays: 7
  });
  const [formError, setFormError] = useState('');

  // Guardar automáticamente en localStorage cada vez que cambian los hábitos
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
    } catch (e) {
      console.error('Error guardando en localStorage:', e);
    }
  }, [habits]);

  // Alternar el estado de completado de un hábito en un día específico
  const toggleHabitDay = (habitId, dayIndex) => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) => {
        if (habit.id !== habitId) return habit;
        const updatedDays = [...habit.completedDays];
        updatedDays[dayIndex] = !updatedDays[dayIndex];
        return { ...habit, completedDays: updatedDays };
      })
    );
  };

  // Marcar todos los hábitos para el día actual seleccionado
  const completeAllToday = () => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) => {
        const updatedDays = [...habit.completedDays];
        updatedDays[selectedDayIndex] = true;
        return { ...habit, completedDays: updatedDays };
      })
    );
  };

  // Abrir modal para nuevo hábito
  const openCreateModal = () => {
    setEditingHabit(null);
    setFormData({
      name: '',
      description: '',
      category: 'entrenamiento',
      targetDays: 6
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // Abrir modal para editar hábito existente
  const openEditModal = (habit) => {
    setEditingHabit(habit);
    setFormData({
      name: habit.name,
      description: habit.description || '',
      category: habit.category,
      targetDays: habit.targetDays || 7
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // Guardar hábito (Crear o Editar)
  const handleSaveHabit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Por favor, ingresa un nombre para el hábito.');
      return;
    }

    if (editingHabit) {
      setHabits((prev) =>
        prev.map((h) =>
          h.id === editingHabit.id
            ? {
                ...h,
                name: formData.name.trim(),
                description: formData.description.trim(),
                category: formData.category,
                targetDays: Number(formData.targetDays)
              }
            : h
        )
      );
    } else {
      const newHabit = {
        id: 'hab-' + Date.now(),
        name: formData.name.trim(),
        description: formData.description.trim() || 'Objetivo diario personalizado',
        category: formData.category,
        targetDays: Number(formData.targetDays),
        completedDays: [false, false, false, false, false, false, false],
        historicalStreak: 0
      };
      setHabits((prev) => [newHabit, ...prev]);
    }

    setIsModalOpen(false);
  };

  // Confirmar eliminación de un hábito
  const handleDeleteRequest = (habit) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar hábito',
      message: `¿Estás seguro de que deseas eliminar "${habit.name}"? Perderás el registro de esta semana.`,
      confirmText: 'Eliminar hábito',
      type: 'danger',
      onConfirm: () => {
        setHabits((prev) => prev.filter((h) => h.id !== habit.id));
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Opciones de reinicio (Limpiar marcas de la semana o restaurar datos de demostración)
  const handleClearWeekRequest = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Iniciar nueva semana en blanco',
      message: 'Esto desmarcará todos los días de la semana actual en tus hábitos para que empieces desde cero. Tus hábitos creados se mantendrán.',
      confirmText: 'Limpiar semana',
      type: 'warning',
      onConfirm: () => {
        setHabits((prev) =>
          prev.map((h) => ({
            ...h,
            completedDays: [false, false, false, false, false, false, false]
          }))
        );
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleRestoreDemoRequest = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Restaurar hábitos de ejemplo',
      message: 'Se restablecerán los 5 hábitos predeterminados (Calistenia, Lectura, Estudio, Taller e Hidratación) con sus datos de ejemplo.',
      confirmText: 'Restaurar ejemplos',
      type: 'info',
      onConfirm: () => {
        setHabits(INITIAL_HABITS);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Filtrado de hábitos según categoría
  const filteredHabits = useMemo(() => {
    if (categoryFilter === 'todas') return habits;
    return habits.filter((h) => h.category === categoryFilter);
  }, [habits, categoryFilter]);

  // Cálculos estadísticos en tiempo real
  const stats = useMemo(() => {
    const totalHabits = habits.length;
    if (totalHabits === 0) {
      return {
        longestStreak: 0,
        longestStreakHabitName: 'Sin hábitos',
        weeklyPercentage: 0,
        totalCompletedWeek: 0,
        totalTargetWeek: 0,
        completedToday: 0,
        totalHabits: 0,
        todayPercentage: 0
      };
    }

    let longestStreak = 0;
    let longestStreakHabitName = '';
    let totalCompletedWeek = 0;
    let totalPossibleSlots = totalHabits * 7;
    let completedToday = 0;

    habits.forEach((habit) => {
      const { maxWeeklyStreak } = calculateStreaks(habit.completedDays, selectedDayIndex);
      if (maxWeeklyStreak > longestStreak) {
        longestStreak = maxWeeklyStreak;
        longestStreakHabitName = habit.name;
      }

      const completedCount = habit.completedDays.filter(Boolean).length;
      totalCompletedWeek += completedCount;

      if (habit.completedDays[selectedDayIndex]) {
        completedToday++;
      }
    });

    const weeklyPercentage = Math.round((totalCompletedWeek / totalPossibleSlots) * 100);
    const todayPercentage = Math.round((completedToday / totalHabits) * 100);

    return {
      longestStreak,
      longestStreakHabitName: longestStreakHabitName || 'Ninguna racha aún',
      weeklyPercentage,
      totalCompletedWeek,
      totalPossibleSlots,
      completedToday,
      totalHabits,
      todayPercentage
    };
  }, [habits, selectedDayIndex]);

  // Datos para el gráfico de barras de rendimiento por día de la semana
  const weeklyChartData = useMemo(() => {
    return DAYS_OF_WEEK.map((day, idx) => {
      const completedCount = habits.reduce(
        (acc, habit) => acc + (habit.completedDays[idx] ? 1 : 0),
        0
      );
      const total = habits.length;
      const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

      return {
        name: day.short,
        fullName: day.full,
        completados: completedCount,
        total: total,
        porcentaje: percentage,
        isToday: idx === selectedDayIndex
      };
    });
  }, [habits, selectedDayIndex]);

  // Tooltip personalizado para el gráfico de Recharts
  const CustomChartTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-slate-700/80 p-3.5 rounded-xl shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-slate-100 text-sm">{data.fullName}</span>
            {data.isToday && (
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Día Activo
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mb-2">
            Rendimiento del día: <span className="text-emerald-400 font-semibold">{data.porcentaje}%</span>
          </p>
          <div className="flex items-center justify-between gap-4 text-xs bg-slate-800/80 px-2.5 py-1.5 rounded-lg">
            <span className="text-slate-300">Hábitos cumplidos:</span>
            <span className="font-bold text-white">
              {data.completados} / {data.total}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 pb-16">
      {/* Efectos de iluminación ambiental en el fondo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-[130px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Contenedor Principal */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        
        {/* CABECERA SUPERIOR */}
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-8 border-b border-slate-800/80">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sistema de Disciplina & Alto Rendimiento</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Panel de Control de Hábitos
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
              Monitorea tu consistencia diaria, construye rachas inquebrantables y visualiza tu progreso semanal en tiempo real.
            </p>
          </div>

          {/* Botones de Acción Principal */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleClearWeekRequest}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer"
              title="Desmarcar todos los días para empezar una nueva semana"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
              <span>Reiniciar Semana</span>
            </button>

            <button
              onClick={handleRestoreDemoRequest}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer"
              title="Cargar nuevamente los datos de ejemplo iniciales"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Datos Demo</span>
            </button>

            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/40 transition-all duration-200 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Nuevo Hábito</span>
            </button>
          </div>
        </header>

        {/* BARRA SELECTORA DE DÍA ACTIVO ("HOY") */}
        <div className="my-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 sm:p-4 backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Día de Enfoque Activo
              </h2>
              <p className="text-sm text-slate-200">
                Mostrando métricas de <span className="font-bold text-white">{DAYS_OF_WEEK[selectedDayIndex].full}</span> como &ldquo;Hoy&rdquo;
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-end bg-slate-950/80 p-1.5 rounded-xl border border-slate-800/80">
            {DAYS_OF_WEEK.map((day, idx) => {
              const isSelected = idx === selectedDayIndex;
              const isRealToday = idx === getRealTodayIndex();
              return (
                <button
                  key={day.short}
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex flex-col items-center ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <span>{day.short}</span>
                  {isRealToday && (
                    <span
                      className={`w-1 h-1 rounded-full mt-0.5 ${
                        isSelected ? 'bg-white' : 'bg-indigo-400'
                      }`}
                      title="Día actual del calendario"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 1. TARJETAS DE RESUMEN DE ESTADÍSTICAS EN TIEMPO REAL */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {/* Tarjeta 1: Racha actual más larga */}
          <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800/90 p-6 shadow-xl backdrop-blur-sm group hover:border-amber-500/40 transition-all duration-300">
            <div className="absolute -right-6 -top-6 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400/90 mb-2">
                  <Flame className="w-4 h-4 fill-amber-400/20" />
                  Racha Semanal Más Larga
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-extrabold text-white tracking-tight">
                    {stats.longestStreak}
                  </span>
                  <span className="text-sm font-medium text-slate-400">
                    {stats.longestStreak === 1 ? 'día seguido' : 'días seguidos'}
                  </span>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-inner">
                <Trophy className="w-7 h-7" />
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Hábito líder:</span>
              <span className="font-semibold text-amber-300 truncate max-w-[190px]">
                {stats.longestStreakHabitName}
              </span>
            </div>
          </div>

          {/* Tarjeta 2: Porcentaje de cumplimiento semanal */}
          <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800/90 p-6 shadow-xl backdrop-blur-sm group hover:border-indigo-500/40 transition-all duration-300">
            <div className="absolute -right-6 -top-6 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">
                  <TrendingUp className="w-4 h-4" />
                  Cumplimiento Semanal
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-extrabold text-white tracking-tight">
                    {stats.weeklyPercentage}%
                  </span>
                  <span className="text-sm font-medium text-slate-400">
                    ({stats.totalCompletedWeek}/{stats.totalPossibleSlots} checks)
                  </span>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-inner">
                <BarChart3 className="w-7 h-7" />
              </div>
            </div>
            {/* Barra de progreso visual */}
            <div className="mt-5 pt-2">
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${stats.weeklyPercentage}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2">
                <span>Progreso global de la semana</span>
                <span className="text-indigo-300 font-semibold">
                  {stats.weeklyPercentage >= 80
                    ? '¡Nivel Excelente!'
                    : stats.weeklyPercentage >= 50
                    ? 'Buen ritmo'
                    : 'Sigue empujando'}
                </span>
              </div>
            </div>
          </div>

          {/* Tarjeta 3: Hábitos completados hoy */}
          <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800/90 p-6 shadow-xl backdrop-blur-sm group hover:border-emerald-500/40 transition-all duration-300">
            <div className="absolute -right-6 -top-6 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Completados Hoy ({DAYS_OF_WEEK[selectedDayIndex].short})
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-extrabold text-white tracking-tight">
                    {stats.completedToday}
                  </span>
                  <span className="text-xl font-bold text-slate-500">
                    / {stats.totalHabits}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ml-1">
                    {stats.todayPercentage}%
                  </span>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-inner">
                <Target className="w-7 h-7" />
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                {stats.completedToday === stats.totalHabits && stats.totalHabits > 0
                  ? '¡Día perfecto completado!'
                  : `Faltan ${stats.totalHabits - stats.completedToday} para el 100% hoy`}
              </span>
              {stats.completedToday < stats.totalHabits && stats.totalHabits > 0 && (
                <button
                  onClick={completeAllToday}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4 cursor-pointer"
                >
                  Marcar todos hoy
                </button>
              )}
            </div>
          </div>
        </section>

        {/* 2. MATRIZ INTERACTIVA DE SEGUIMIENTO SEMANAL (LUNES A DOMINGO) */}
        <section className="bg-slate-900/75 border border-slate-800/90 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden mb-8">
          {/* Cabecera de la tabla y filtros de categoría */}
          <div className="p-5 sm:p-6 border-b border-slate-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5">
                <span>Registro Semanal de Objetivos</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {filteredHabits.length} {filteredHabits.length === 1 ? 'hábito' : 'hábitos'}
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Haz clic en cada casilla diaria para registrar o desmarcar tu progreso de Lunes a Domingo.
              </p>
            </div>

            {/* Píldoras de filtro por categoría */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setCategoryFilter('todas')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  categoryFilter === 'todas'
                    ? 'bg-slate-100 text-slate-900 shadow-sm'
                    : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                Todas
              </button>
              {Object.values(CATEGORIES).map((cat) => {
                const IconComp = cat.icon;
                const isSelected = categoryFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
                      isSelected
                        ? `${cat.bgLight} ${cat.text} ${cat.border}`
                        : 'bg-slate-800/40 text-slate-400 border-transparent hover:bg-slate-800/80 hover:text-slate-200'
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                    <span>{cat.shortName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tabla / Cuadrícula Responsiva */}
          {filteredHabits.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                No hay hábitos en esta vista
              </h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
                Comienza agregando un nuevo objetivo diario para construir tu disciplina semanal.
              </p>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Primer Hábito</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[760px]">
                <thead>
                  <tr className="border-b border-slate-800/80 bg-slate-950/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-4 pl-6 pr-4 w-[34%]">Hábito / Categoría</th>
                    {DAYS_OF_WEEK.map((day, idx) => {
                      const isToday = idx === selectedDayIndex;
                      return (
                        <th
                          key={day.short}
                          className={`py-4 px-2 text-center w-[7%] ${
                            isToday ? 'text-indigo-400 bg-indigo-500/5' : ''
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            <span>{day.short}</span>
                            {isToday && (
                              <span className="text-[9px] font-extrabold text-indigo-400 tracking-tighter mt-0.5">
                                HOY
                              </span>
                            )}
                          </div>
                        </th>
                      );
                    })}
                    <th className="py-4 px-4 text-center w-[10%]">Racha</th>
                    <th className="py-4 pl-2 pr-6 text-right w-[7%]">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {filteredHabits.map((habit) => {
                    const category = CATEGORIES[habit.category] || CATEGORIES.entrenamiento;
                    const IconComp = category.icon;
                    const { maxWeeklyStreak } = calculateStreaks(
                      habit.completedDays,
                      selectedDayIndex
                    );
                    const completedCount = habit.completedDays.filter(Boolean).length;
                    const targetMet = completedCount >= (habit.targetDays || 7);

                    return (
                      <tr
                        key={habit.id}
                        className="group hover:bg-slate-800/30 transition-colors"
                      >
                        {/* Información del hábito */}
                        <td className="py-4 pl-6 pr-4">
                          <div className="flex items-start gap-3.5">
                            <div
                              className={`p-2.5 rounded-xl ${category.bgLight} ${category.border} border ${category.text} shrink-0 mt-0.5`}
                            >
                              <IconComp className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-100 group-hover:text-white transition-colors">
                                  {habit.name}
                                </span>
                                <span
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${category.bgLight} ${category.border} ${category.text}`}
                                >
                                  {category.shortName}
                                </span>
                              </div>
                              {habit.description && (
                                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                                  {habit.description}
                                </p>
                              )}
                              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                                <span>
                                  Meta: <strong className="text-slate-300">{habit.targetDays || 7}d/sem</strong>
                                </span>
                                <span>•</span>
                                <span className={targetMet ? 'text-emerald-400 font-semibold' : ''}>
                                  Logrado: {completedCount}/7
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Botones de los 7 días de la semana */}
                        {DAYS_OF_WEEK.map((day, dayIdx) => {
                          const isDone = habit.completedDays[dayIdx];
                          const isToday = dayIdx === selectedDayIndex;

                          return (
                            <td
                              key={day.short}
                              className={`py-4 px-2 text-center ${
                                isToday ? 'bg-indigo-500/5' : ''
                              }`}
                            >
                              <button
                                onClick={() => toggleHabitDay(habit.id, dayIdx)}
                                aria-label={`Marcar ${habit.name} el ${day.full}`}
                                className={`w-10 h-10 rounded-xl mx-auto flex items-center justify-center transition-all duration-200 cursor-pointer border ${
                                  isDone
                                    ? 'text-white shadow-lg scale-100 hover:scale-105'
                                    : isToday
                                    ? 'bg-slate-900/90 border-indigo-500/40 text-slate-600 hover:border-indigo-400 hover:text-slate-300'
                                    : 'bg-slate-900/60 border-slate-800 text-slate-700 hover:border-slate-700 hover:bg-slate-800/60 hover:text-slate-400'
                                }`}
                                style={
                                  isDone
                                    ? {
                                        backgroundColor: category.color,
                                        borderColor: category.color,
                                        boxShadow: `0 6px 16px -4px ${category.color}66`
                                      }
                                    : {}
                                }
                              >
                                <Check
                                  className={`w-5 h-5 stroke-[3] transition-transform duration-200 ${
                                    isDone ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
                                  }`}
                                />
                              </button>
                            </td>
                          );
                        })}

                        {/* Columna de Racha Semanal */}
                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
                            <Flame
                              className={`w-4 h-4 ${
                                maxWeeklyStreak >= 3
                                  ? 'text-amber-400 fill-amber-400/30 animate-pulse'
                                  : maxWeeklyStreak > 0
                                  ? 'text-orange-400'
                                  : 'text-slate-600'
                              }`}
                            />
                            <span
                              className={`font-extrabold text-sm ${
                                maxWeeklyStreak > 0 ? 'text-white' : 'text-slate-500'
                              }`}
                            >
                              {maxWeeklyStreak}d
                            </span>
                          </div>
                        </td>

                        {/* Acciones: Editar / Eliminar */}
                        <td className="py-4 pl-2 pr-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(habit)}
                              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Editar hábito"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteRequest(habit)}
                              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Eliminar hábito"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* 4. SECCIÓN DE GRÁFICOS INTERACTIVOS DE RENDIMIENTO Y RACHAS */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Gráfico 1: Gráfico de Barras de Hábitos Completados por Día de la Semana */}
          <div className="lg:col-span-7 bg-slate-900/75 border border-slate-800/90 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4" />
                    Analítica de Consistencia
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                    Hábitos Completados por Día
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 bg-slate-950/70 px-3 py-1.5 rounded-xl border border-slate-800">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block" />
                    Día normal
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block" />
                    Hoy ({DAYS_OF_WEEK[selectedDayIndex].short})
                  </span>
                </div>
              </div>

              {/* Contenedor del Gráfico Recharts */}
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weeklyChartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#1e293b"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                      dy={8}
                    />
                    <YAxis
                      allowDecimals={false}
                      domain={[0, Math.max(habits.length, 1)]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <Tooltip
                      content={<CustomChartTooltip />}
                      cursor={{ fill: 'rgba(148, 163, 184, 0.06)' }}
                    />
                    {habits.length > 0 && (
                      <ReferenceLine
                        y={habits.length}
                        stroke="#10b981"
                        strokeDasharray="4 4"
                        strokeOpacity={0.4}
                      />
                    )}
                    <Bar
                      dataKey="completados"
                      radius={[8, 8, 2, 2]}
                      maxBarSize={48}
                      animationDuration={600}
                    >
                      {weeklyChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.isToday
                              ? '#10b981' // Esmeralda para destacar el día actual
                              : entry.completados === entry.total && entry.total > 0
                              ? '#8b5cf6' // Violeta si cumplió el 100% ese día
                              : '#6366f1' // Índigo estándar
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie del gráfico con resumen rápido */}
            <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/60">
                <span className="text-[11px] text-slate-400 block">Mejor Día</span>
                <span className="text-sm font-bold text-white">
                  {weeklyChartData.reduce(
                    (best, cur) => (cur.completados > best.completados ? cur : best),
                    weeklyChartData[0]
                  )?.fullName || '-'}
                </span>
              </div>
              <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/60">
                <span className="text-[11px] text-slate-400 block">Promedio Diario</span>
                <span className="text-sm font-bold text-indigo-400">
                  {(stats.totalCompletedWeek / 7).toFixed(1)} hábitos
                </span>
              </div>
              <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/60">
                <span className="text-[11px] text-slate-400 block">Días Perfectos</span>
                <span className="text-sm font-bold text-emerald-400">
                  {
                    weeklyChartData.filter(
                      (d) => d.completados === d.total && d.total > 0
                    ).length
                  }{' '}
                  de 7
                </span>
              </div>
            </div>
          </div>

          {/* Gráfico 2: Barras de Progreso Individual de Racha y Meta por Hábito */}
          <div className="lg:col-span-5 bg-slate-900/75 border border-slate-800/90 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Award className="w-4 h-4" />
                    Desglose Individual
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                    Rachas y Progreso por Hábito
                  </h3>
                </div>
              </div>

              {habits.length === 0 ? (
                <p className="text-sm text-slate-400 py-12 text-center">
                  Agrega hábitos para visualizar sus barras de racha individuales.
                </p>
              ) : (
                <div className="space-y-5 max-h-[340px] overflow-y-auto pr-1">
                  {habits.map((habit) => {
                    const category =
                      CATEGORIES[habit.category] || CATEGORIES.entrenamiento;
                    const IconComp = category.icon;
                    const { maxWeeklyStreak, activeStreak } = calculateStreaks(
                      habit.completedDays,
                      selectedDayIndex
                    );
                    const totalCompleted = habit.completedDays.filter(Boolean).length;
                    const percentageWeek = Math.round((totalCompleted / 7) * 100);
                    const targetDays = habit.targetDays || 7;
                    const targetPercentage = Math.min(
                      100,
                      Math.round((totalCompleted / targetDays) * 100)
                    );

                    return (
                      <div
                        key={habit.id}
                        className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition-all"
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`p-1.5 rounded-lg ${category.bgLight} ${category.text} shrink-0`}
                            >
                              <IconComp className="w-4 h-4" />
                            </span>
                            <span className="font-semibold text-sm text-slate-100 truncate">
                              {habit.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                              <Flame className="w-3 h-3 fill-amber-400" />
                              Racha máx: {maxWeeklyStreak}d
                            </span>
                          </div>
                        </div>

                        {/* Barra de progreso visual */}
                        <div className="w-full h-2.5 bg-slate-800/90 rounded-full overflow-hidden my-2">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${percentageWeek}%`,
                              backgroundColor: category.color
                            }}
                          />
                        </div>

                        {/* Mini indicadores de los 7 días y cumplimiento de meta */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
                          <span>
                            Racha actual hoy:{' '}
                            <strong className="text-slate-200">{activeStreak} días</strong>
                          </span>
                          <span>
                            Semana:{' '}
                            <strong
                              style={{ color: category.color }}
                              className="font-bold"
                            >
                              {totalCompleted}/7 días ({percentageWeek}%)
                            </strong>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Datos sincronizados en almacenamiento local</span>
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Autoguardado activo
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* MODAL PARA CREAR / EDITAR HÁBITO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">
                {editingHabit ? 'Editar Hábito Diario' : 'Nuevo Hábito Diario'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHabit} className="space-y-5 mt-5">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Nombre del Objetivo / Hábito *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formError) setFormError('');
                  }}
                  placeholder="Ej: Entrenamiento de Calistenia, Lectura 30 min..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Descripción o Detalle Corto
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Ej: 4 series de dominadas y fondos + movilidad"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Selector de Categoría con Iconos */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Categoría
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Object.values(CATEGORIES).map((cat) => {
                    const IconComp = cat.icon;
                    const isSelected = formData.category === cat.id;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() =>
                          setFormData({ ...formData, category: cat.id })
                        }
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? `${cat.bgLight} ${cat.border} ${cat.text} shadow-sm`
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <IconComp className="w-5 h-5 shrink-0" />
                        <span className="text-xs font-semibold truncate">
                          {cat.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Meta de días por semana */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Frecuencia Objetivo Semanal
                  </label>
                  <span className="text-xs font-bold text-indigo-400">
                    {formData.targetDays} {formData.targetDays === 1 ? 'día' : 'días'} / semana
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={formData.targetDays}
                  onChange={(e) =>
                    setFormData({ ...formData, targetDays: Number(e.target.value) })
                  }
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>1 día</span>
                  <span>3 días</span>
                  <span>5 días</span>
                  <span>Todos los días (7)</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  {editingHabit ? 'Guardar Cambios' : 'Crear Hábito'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN PERSONALIZADO (Sin usar alert/confirm nativos) */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">
              {confirmModal.title}
            </h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() =>
                  setConfirmModal((prev) => ({ ...prev, isOpen: false }))
                }
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className={`px-4 py-2 rounded-xl text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  confirmModal.type === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/25'
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25'
                }`}
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}