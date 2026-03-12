import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const API_BASE = 'http://localhost:8090/api/v1';

export default function Home() {
    const navigate = useNavigate();
    
    const [availableSprints, setAvailableSprints] = useState([]);
    const [activeSprintId, setActiveSprintId] = useState(null); 
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [isAiModalOpen, setAiModalOpen] = useState(false);

    // 1. CARGAMOS LOS SPRINTS
    useEffect(() => {
        const fetchSprints = async () => {
            try {
                const response = await fetch(`${API_BASE}/sprints`);
                if (response.ok) {
                    const sprintsData = await response.json();
                    setAvailableSprints(sprintsData);
                    if (sprintsData.length > 0) setActiveSprintId(sprintsData[0].id);
                    else setLoading(false); 
                }
            } catch (error) {
                console.error("Error al cargar la lista de Sprints:", error);
                setLoading(false);
            }
        };
        fetchSprints();
    }, []);

    // 2. CARGAMOS LOS DATOS REALES DEL BACKEND
    useEffect(() => {
        if (!activeSprintId) return; 

        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE}/analytics/dashboard/sprint/${activeSprintId}`);
                if (response.ok) {
                    const data = await response.json();
                    setDashboardData(data);
                } else {
                    setDashboardData(null); 
                }
            } catch (error) {
                console.error("Error al cargar los gráficos:", error);
                setDashboardData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [activeSprintId]);


    // =========================================================
    // 🚀 MODO DEMO / PRESENTACIÓN (DATOS SIMULADOS VISUALMENTE)
    // =========================================================
    
    // Obtenemos los puntos reales que arrastraste (ej: 5)
    const totalPoints = dashboardData?.metrics?.totalPoints || 0;

    // 1. Simulamos un Burndown realista de 5 días basado en los puntos totales
    const demoBurndown = [
        { day: 'Día 1 (Inicio)', ideal: totalPoints, real: totalPoints },
        { day: 'Día 2', ideal: totalPoints * 0.8, real: totalPoints }, // El equipo no avanzó el día 2
        { day: 'Día 3', ideal: totalPoints * 0.6, real: totalPoints * 0.7 }, // Empezaron a terminar tareas
        { day: 'Día 4', ideal: totalPoints * 0.4, real: totalPoints * 0.3 }, // Superaron la línea ideal
        { day: 'Día 5', ideal: totalPoints * 0.2, real: totalPoints * 0.1 },
        { day: 'Día 6 (Fin)', ideal: 0, real: 0 } // ¡Sprint completado!
    ];

    // 2. Simulamos el Esfuerzo del Equipo repartiendo los puntos
    const demoTeamEffort = [
        { memberName: 'Sergio (SA)', points: Math.ceil(totalPoints * 0.6) }, // Se lleva el 60% del trabajo
        { memberName: 'Jose (JO)', points: Math.floor(totalPoints * 0.4) }   // Se lleva el 40% del trabajo
    ];

    // ==========================================
    // ARMADO DE GRÁFICOS CON LOS DATOS DE DEMO
    // ==========================================
    const burndownData = dashboardData ? {
        labels: demoBurndown.map(b => b.day),
        datasets: [
            {
                label: 'Línea Ideal',
                data: demoBurndown.map(b => b.ideal),
                borderColor: '#cbd5e1',
                borderWidth: 3,
                borderDash: [5, 5],
                fill: false,
                tension: 0
            },
            {
                label: `Trabajo Real`,
                data: demoBurndown.map(b => b.real),
                borderColor: '#f97316',
                borderWidth: 5, 
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                fill: true,
                tension: 0.4 // Curva suavizada
            }
        ]
    } : null;

    const burndownOptions = {
        maintainAspectRatio: false,
        plugins: { legend: { labels: { font: { size: 16, weight: 'bold' } } } },
        scales: {
            y: { 
                beginAtZero: true,
                ticks: { font: { size: 14, weight: 'bold' } } 
            },
            x: { ticks: { font: { size: 14, weight: 'bold' } } }
        }
    };

    // La distribución (Features/Bugs) sí la dejamos real desde tu BD
    const distributionData = dashboardData && dashboardData.distribution ? {
        labels: Object.keys(dashboardData.distribution),
        datasets: [{ 
            data: Object.values(dashboardData.distribution), 
            backgroundColor: ['#f97316', '#0f172a', '#ef4444'] 
        }]
    } : null;

    // Usamos nuestro esfuerzo de equipo simulado
    const teamEffortData = dashboardData ? {
        labels: demoTeamEffort.map(t => t.memberName),
        datasets: [{ 
            label: 'Puntos Asignados', 
            backgroundColor: ['#f97316', '#3b82f6'], 
            data: demoTeamEffort.map(t => t.points),
            borderRadius: 6
        }]
    } : null;

    const activeSprintName = availableSprints.find(s => s.id === activeSprintId)?.name || '';

    // Simulamos un progreso visual del 80% para la demo en lugar del 0%
    const displayProgress = totalPoints > 0 ? 80 : 0; 

    return (
        <div className="dashboard-wrapper">
            <aside className="dashboard-sidebar">
                <div className="brand">ManageWise</div>
                <nav className="nav-links">
                    <div className="nav-item active" onClick={() => navigate('/home')}><i className="pi pi-chart-line"></i> DASHBOARD</div>
                    <div className="nav-item" onClick={() => navigate('/backlog')}><i className="pi pi-list"></i> BACKLOG</div>
                    <div className="nav-item" onClick={() => navigate('/members')}><i className="pi pi-users"></i> TEAM</div>
                    <div className="nav-item" onClick={() => navigate('/meeting')}><i className="pi pi-video"></i> MEETINGS</div>
                    
                    <div className="nav-item" onClick={() => setAiModalOpen(true)}>
                        <i className="pi pi-history"></i> ACTIVITY FEED <span className="pro-text">PRO</span>
                    </div>
                    <div className="nav-item" onClick={() => setAiModalOpen(true)}>
                        <i className="pi pi-file-export"></i> REPORTES <span className="pro-text">PRO</span>
                    </div>
                    <div className="nav-item ai-nav-item" onClick={() => setAiModalOpen(true)}>
                        <i className="pi pi-sparkles" style={{ color: '#fbbf24' }}></i> 
                        <div className="ai-text"><span>ManageWise</span><span>AI</span></div>
                        <span className="pro-text">PRO</span>
                    </div>
                </nav>
                <div className="sidebar-footer">
                    <div className="nav-item exit-item" onClick={() => navigate('/projects')}>
                        <i className="pi pi-arrow-left"></i> Ir a Proyectos
                    </div>
                </div>
            </aside>

            <main className="dashboard-content">
                <div className="content-inner">
                    <header className="content-header">
                        <div>
                            <h1>Panel de Control del Proyecto</h1>
                            <p>Gestión avanzada de rendimiento para <strong>ManageWise</strong>.</p>
                        </div>
                        <div className="export-actions">
                            <span className="export-label">Exportar Reportes:</span>
                            <div className="export-buttons-group">
                                <Button icon="pi pi-file-pdf" className="p-button-danger action-btn-sm" onClick={() => setAiModalOpen(true)} />
                                <Button icon="pi pi-file-excel" className="p-button-outlined p-button-success action-btn-sm" onClick={() => setAiModalOpen(true)} />
                                <Button icon="pi pi-chart-bar" className="p-button-outlined p-button-help action-btn-sm" onClick={() => setAiModalOpen(true)} />
                            </div>
                        </div>
                    </header>

                    {loading ? (
                        <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
                            <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem', marginBottom: '1rem', color: '#f97316' }}></i>
                            <h2>Cargando métricas...</h2>
                        </div>
                    ) : availableSprints.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#fff', borderRadius: '12px', marginTop: '2rem' }}>
                            <i className="pi pi-box" style={{ fontSize: '4rem', marginBottom: '1rem', color: '#94a3b8' }}></i>
                            <h2>Aún no hay Sprints en tu Proyecto</h2>
                            <p style={{ color: '#64748b', marginBottom: '2rem' }}>Ve a la pestaña de Backlog para planificar tu primer Sprint.</p>
                            <Button label="Ir al Backlog" icon="pi pi-list" onClick={() => navigate('/backlog')} />
                        </div>
                    ) : !dashboardData || totalPoints === 0 ? (
                        <div className="main-grid-layout">
                            <div className="sprint-navigation">
                                <h2 className="section-label">Sprints del Proyecto</h2>
                                <div className="sprint-list">
                                    {availableSprints.map(sprint => (
                                        <div 
                                            key={sprint.id} 
                                            className={`sprint-hero-card ${activeSprintId === sprint.id ? 'active' : ''}`}
                                            onClick={() => setActiveSprintId(sprint.id)}
                                        >
                                            <div className="sprint-main-info">
                                                <span className="sprint-number">{sprint.name}</span>
                                                <Tag value={sprint.status || 'PLANNING'} severity={sprint.status === 'ACTIVE' ? 'success' : 'secondary'} />
                                            </div>
                                            <i className="pi pi-chevron-right"></i>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div style={{ gridColumn: 'span 3', padding: '3rem', textAlign: 'center', backgroundColor: '#fff', borderRadius: '12px' }}>
                                <i className="pi pi-exclamation-circle text-orange" style={{ fontSize: '4rem', marginBottom: '1rem' }}></i>
                                <h2>Gráficos en espera para "{activeSprintName}"</h2>
                                <p style={{ color: '#64748b' }}>Arrastra historias al Sprint en el Backlog para ver la simulación de métricas.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="main-grid-layout">
                            {/* NAVEGACIÓN DINÁMICA DE SPRINTS */}
                            <div className="sprint-navigation">
                                <h2 className="section-label">Sprints del Proyecto</h2>
                                <div className="sprint-list">
                                    {availableSprints.map(sprint => (
                                        <div 
                                            key={sprint.id} 
                                            className={`sprint-hero-card ${activeSprintId === sprint.id ? 'active' : ''}`}
                                            onClick={() => setActiveSprintId(sprint.id)}
                                        >
                                            <div className="sprint-main-info">
                                                <span className="sprint-number">{sprint.name}</span>
                                                <Tag 
                                                    value={sprint.status || 'PLANNING'} 
                                                    severity={sprint.status === 'ACTIVE' ? 'success' : 'secondary'} 
                                                />
                                            </div>
                                            <i className="pi pi-chevron-right"></i>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="graphics-section">
                                <Card className="grid-full main-card-chart" title={`BURNDOWN SIMULADO: ${activeSprintName.toUpperCase()}`}>
                                    <div className="chart-container">
                                        <Chart type="line" data={burndownData} options={burndownOptions} style={{ height: '450px', width: '100%' }} />
                                    </div>
                                </Card>

                                <div className="lower-grid">
                                    <Card className="grid-half" title="Distribución">
                                        <Chart type="pie" data={distributionData} style={{ height: '280px', width: '100%' }} />
                                    </Card>
                                    <Card className="grid-half" title="Esfuerzo del Equipo">
                                        <Chart type="bar" data={teamEffortData} options={{ scales: { y: { beginAtZero: true } } }} style={{ height: '280px', width: '100%' }} />
                                    </Card>
                                </div>

                                <Card className="grid-full metrics-footer">
                                    <div className="giant-stats">
                                        <div className="g-stat">
                                            <span className="g-label">PUNTOS REALES</span>
                                            <h2 className="g-value">{totalPoints}</h2>
                                        </div>
                                        <div className="g-stat">
                                            <span className="g-label">PROGRESO ESTIMADO</span>
                                            <h2 className="g-value text-orange">{displayProgress}%</h2>
                                        </div>
                                        <div className="g-stat">
                                            <span className="g-label">INCIDENCIAS</span>
                                            <h2 className="g-value text-red">2</h2>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* MODAL EMERGENTE DE PRECIOS (OMITIDO PARA AHORRAR ESPACIO, ES EL MISMO QUE YA TIENES) */}
            <Dialog visible={isAiModalOpen} style={{ width: '400px' }} onHide={() => setAiModalOpen(false)} showHeader={false}>
                <div style={{padding: '2rem', textAlign: 'center'}}>
                    <i className="pi pi-star text-orange" style={{fontSize: '3rem'}}></i>
                    <h2>Actualiza a PRO</h2>
                    <p>Esta función requiere suscripción.</p>
                </div>
            </Dialog>
        </div>
    );
}