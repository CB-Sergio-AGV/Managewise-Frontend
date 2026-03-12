import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home() {
    const navigate = useNavigate();
    const [activeSprint, setActiveSprint] = useState(1);
    
    // ESTADO PARA EL MODAL EMERGENTE DE PRECIOS
    const [isAiModalOpen, setAiModalOpen] = useState(false);

    // ESTADOS PARA EL BACKEND
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    // LLAMADA A SPRING BOOT CUANDO CAMBIA EL SPRINT
    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // NOTA: Recuerda cambiar el "SPRINT-" por tu ID real si ya creaste uno (Ej: "SPR-A1B2C3")
                const response = await fetch(`http://localhost:8090/api/v1/analytics/dashboard/sprint/SPRINT-${activeSprint}`);
                if (response.ok) {
                    const data = await response.json();
                    setDashboardData(data);
                } else {
                    setDashboardData(null);
                }
            } catch (error) {
                console.error("Error al cargar el dashboard:", error);
                setDashboardData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [activeSprint]);


    // ==========================================
    // MAPEO DINÁMICO DE DATOS (Protegido por if ternarios)
    // ==========================================
    const burndownData = dashboardData ? {
        labels: dashboardData.burndown.map(b => b.day),
        datasets: [
            {
                label: 'Línea Ideal',
                data: dashboardData.burndown.map(b => b.ideal),
                borderColor: '#cbd5e1',
                borderWidth: 3,
                borderDash: [5, 5],
                fill: false,
                tension: 0
            },
            {
                label: `Trabajo Real - Sprint ${activeSprint}`,
                data: dashboardData.burndown.map(b => b.real),
                borderColor: '#f97316',
                borderWidth: 5, 
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                fill: true,
                tension: 0.4
            }
        ]
    } : null;

    const burndownOptions = {
        maintainAspectRatio: false,
        plugins: { legend: { labels: { font: { size: 16, weight: 'bold' } } } },
        scales: {
            y: { ticks: { font: { size: 14, weight: 'bold' } } },
            x: { ticks: { font: { size: 14, weight: 'bold' } } }
        }
    };

    const distributionData = dashboardData ? {
        labels: Object.keys(dashboardData.distribution),
        datasets: [{ 
            data: Object.values(dashboardData.distribution), 
            backgroundColor: ['#f97316', '#0f172a', '#ef4444'] 
        }]
    } : null;

    const teamEffortData = dashboardData ? {
        labels: dashboardData.teamEfforts.map(t => t.memberName),
        datasets: [{ 
            label: 'Puntos', 
            backgroundColor: '#f97316', 
            data: dashboardData.teamEfforts.map(t => t.points) 
        }]
    } : null;

    return (
        <div className="dashboard-wrapper">
            
            {/* EL MENÚ LATERAL (Siempre visible) */}
            <aside className="dashboard-sidebar">
                <div className="brand">ManageWise</div>
                
                <nav className="nav-links">
                    <div className="nav-item active" onClick={() => navigate('/home')}><i className="pi pi-chart-line"></i> DASHBOARD</div>
                    <div className="nav-item" onClick={() => navigate('/backlog')}><i className="pi pi-list"></i> BACKLOG</div>
                    <div className="nav-item" onClick={() => navigate('/members')}><i className="pi pi-users"></i> TEAM</div>
                    <div className="nav-item" onClick={() => navigate('/meeting')}><i className="pi pi-video"></i> MEETINGS</div>
                    
                    <div className="nav-item" onClick={() => navigate('/activity')}>
                        <i className="pi pi-history"></i> ACTIVITY FEED
                        <span className="pro-text">PRO</span>
                    </div>
                    
                    <div className="nav-item" onClick={() => navigate('/reports')}>
                        <i className="pi pi-file-export"></i> REPORTES
                        <span className="pro-text">PRO</span>
                    </div>

                    <div className="nav-item ai-nav-item" onClick={() => navigate('/ManageWiseAI')}>
                        <i className="pi pi-sparkles" style={{ color: '#fbbf24' }}></i> 
                        <div className="ai-text">
                            <span>ManageWise</span>
                            <span>AI</span>
                        </div>
                        <span className="pro-text">PRO</span>
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <div className="nav-item exit-item" onClick={() => navigate('/projects')}>
                        <i className="pi pi-arrow-left"></i> Ir a Proyectos
                    </div>
                </div>
            </aside>

            {/* CONTENIDO PRINCIPAL */}
            <main className="dashboard-content">
                <div className="content-inner">
                    
                    {/* LA CABECERA (Siempre visible) */}
                    <header className="content-header">
                        <div>
                            <h1>Panel de Control del Proyecto</h1>
                            <p>Gestión avanzada de rendimiento para <strong>ManageWise</strong>.</p>
                        </div>
                        
                        <div className="export-actions">
                            <span className="export-label">Exportar Reportes:</span>
                            <div className="export-buttons-group">
                                <Button icon="pi pi-file-pdf" className="p-button-danger action-btn-sm" tooltip="Exportar a PDF" tooltipOptions={{position: 'top'}} onClick={() => setAiModalOpen(true)} />
                                <Button icon="pi pi-file-excel" className="p-button-outlined p-button-success action-btn-sm" tooltip="Exportar a Excel" tooltipOptions={{position: 'top'}} onClick={() => setAiModalOpen(true)} />
                                <Button icon="pi pi-chart-bar" className="p-button-outlined p-button-help action-btn-sm" tooltip="Conectar con Power BI" tooltipOptions={{position: 'top'}} onClick={() => setAiModalOpen(true)} />
                            </div>
                        </div>
                    </header>

                    {/* ======================================================== */}
                    {/* ZONA CONDICIONAL: AQUI DECIDIMOS QUE MOSTRAR EN EL CENTRO */}
                    {/* ======================================================== */}
                    
                    {loading ? (
                        
                        /* ESTADO 1: CARGANDO */
                        <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
                            <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem', marginBottom: '1rem', color: '#f97316' }}></i>
                            <h2>Cargando métricas de tu Sprint...</h2>
                        </div>

                    ) : !dashboardData ? (
                        
                        /* ESTADO 2: NO SE ENCONTRÓ EL SPRINT EN BACKEND */
                        <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#fff', borderRadius: '12px', marginTop: '2rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                            <i className="pi pi-exclamation-circle text-orange" style={{ fontSize: '4rem', marginBottom: '1rem' }}></i>
                            <h2>No hay datos disponibles para el Sprint {activeSprint}</h2>
                            <p style={{ color: '#64748b', marginBottom: '2rem' }}>Este Sprint aún no existe en la base de datos o no tiene Historias de Usuario.</p>
                            <Button label="Volver a intentar" icon="pi pi-refresh" onClick={() => setActiveSprint(1)} />
                        </div>

                    ) : (

                        /* ESTADO 3: ¡DATOS LISTOS! MOSTRAMOS LOS GRÁFICOS */
                        <div className="main-grid-layout">
                            
                            <div className="sprint-navigation">
                                <h2 className="section-label">Sprints del Proyecto</h2>
                                <div className="sprint-list">
                                    {[1, 2, 3].map(num => (
                                        <div 
                                            key={num} 
                                            className={`sprint-hero-card ${activeSprint === num ? 'active' : ''}`}
                                            onClick={() => setActiveSprint(num)}
                                        >
                                            <div className="sprint-main-info">
                                                <span className="sprint-number">SPRINT 0{num}</span>
                                                <Tag 
                                                    value={activeSprint === num ? 'ACTIVE' : 'CLOSED'} 
                                                    severity={activeSprint === num ? 'success' : 'secondary'} 
                                                />
                                            </div>
                                            <i className="pi pi-chevron-right"></i>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="graphics-section">
                                <Card className="grid-full main-card-chart" title={`BURNDOWN: SPRINT ${activeSprint}`}>
                                    <div className="chart-container">
                                        <Chart type="line" data={burndownData} options={burndownOptions} style={{ height: '450px', width: '100%' }} />
                                    </div>
                                </Card>

                                <div className="lower-grid">
                                    <Card className="grid-half" title="Distribución">
                                        <Chart type="pie" data={distributionData} style={{ height: '280px', width: '100%' }} />
                                    </Card>

                                    <Card className="grid-half" title="Esfuerzo del Equipo">
                                        <Chart type="bar" data={teamEffortData} style={{ height: '280px', width: '100%' }} />
                                    </Card>
                                </div>

                                <Card className="grid-full metrics-footer">
                                    <div className="giant-stats">
                                        <div className="g-stat">
                                            <span className="g-label">PUNTOS TOTALES</span>
                                            <h2 className="g-value">{dashboardData.metrics.totalPoints}</h2>
                                        </div>
                                        <div className="g-stat">
                                            <span className="g-label">PROGRESO</span>
                                            <h2 className="g-value text-orange">{dashboardData.metrics.progressPercentage}%</h2>
                                        </div>
                                        <div className="g-stat">
                                            <span className="g-label">INCIDENCIAS</span>
                                            <h2 className="g-value text-red">{dashboardData.metrics.incidences}</h2>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* MODAL EMERGENTE DE PRECIOS */}
            <Dialog 
                visible={isAiModalOpen} 
                style={{ width: '90vw', maxWidth: '1100px' }} 
                onHide={() => setAiModalOpen(false)}
                className="pricing-dialog"
                showHeader={false}
                dismissableMask={true}
            >
                <div className="pricing-popup-container">
                    <div className="popup-close-btn" onClick={() => setAiModalOpen(false)}>
                        <i className="pi pi-times"></i>
                    </div>
                    
                    <div className="upgrade-header">
                        <h1>Actualiza tu Plan</h1>
                        <p>ManageWise AI y las exportaciones avanzadas requieren una suscripción activa.</p>
                    </div>

                    <div className="pricing-grid">
                        <div className="pricing-card">
                            <div className="pricing-header">
                                <h3>Light</h3>
                                <p>Get the basics</p>
                                <div className="price">
                                    <span className="currency">$</span><span className="amount">0</span><span className="period">/mo</span>
                                </div>
                            </div>
                            <div className="pricing-features">
                                <ul>
                                    <li><i className="pi pi-check"></i> Hasta 2 Proyectos</li>
                                    <li><i className="pi pi-check"></i> 5 Colaboradores</li>
                                    <li className="disabled"><i className="pi pi-times"></i> Exportación de Reportes</li>
                                    <li className="disabled"><i className="pi pi-times"></i> Asistente ManageWise AI</li>
                                </ul>
                            </div>
                            <Button label="Tu Plan Actual" className="p-button-outlined p-button-secondary w-full" disabled />
                        </div>

                        <div className="pricing-card popular">
                            <div className="recommended-badge">RECOMENDADO</div>
                            <div className="pricing-header">
                                <h3>Pro Business</h3>
                                <p>Grow your brand</p>
                                <div className="price">
                                    <span className="currency">$</span><span className="amount">29</span><span className="period">/mo</span>
                                </div>
                            </div>
                            <div className="pricing-features">
                                <ul>
                                    <li><i className="pi pi-check"></i> Proyectos Ilimitados</li>
                                    <li><i className="pi pi-check"></i> 20 Colaboradores</li>
                                    <li><i className="pi pi-check"></i> Reportes PDF y Excel</li>
                                    <li><i className="pi pi-check"></i> <strong>ManageWise AI (Básico)</strong></li>
                                </ul>
                            </div>
                            <Button label="Actualizar a Pro" className="p-button-orange w-full" onClick={() => alert('Redirigiendo a pasarela de pago...')} />
                        </div>

                        <div className="pricing-card elite">
                            <div className="pricing-header">
                                <h3>Gold Elite</h3>
                                <p>Scale your business</p>
                                <div className="price">
                                    <span className="currency">$</span><span className="amount">99</span><span className="period">/mo</span>
                                </div>
                            </div>
                            <div className="pricing-features">
                                <ul>
                                    <li><i className="pi pi-check"></i> Todo en Pro Business</li>
                                    <li><i className="pi pi-check"></i> Colaboradores Ilimitados</li>
                                    <li><i className="pi pi-check"></i> Integración Power BI</li>
                                    <li><i className="pi pi-check"></i> <strong>ManageWise AI (Ilimitado)</strong></li>
                                </ul>
                            </div>
                            <Button label="Actualizar a Gold Elite" className="p-button-outlined p-button-help w-full" onClick={() => alert('Abriendo chat...')} />
                        </div>
                    </div>
                </div>
            </Dialog>

        </div>
    );
}