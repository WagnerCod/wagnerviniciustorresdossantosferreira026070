import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HealthCheckService, HealthStatus } from './health-check.service';
import { environment } from '../../../environments/environment';

describe('HealthCheckService', () => {
    let service: HealthCheckService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                provideZonelessChangeDetection(),
                HealthCheckService
            ]
        });
        service = TestBed.inject(HealthCheckService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
        service.stopMonitoring();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('checkHealth', () => {
        it('should return true when API is available', (done) => {
            service.checkHealth().subscribe(isHealthy => {
                expect(isHealthy).toBe(true);
                done();
            });

            const req = httpMock.expectOne(`${environment.apiUrl}`);
            expect(req.request.method).toBe('HEAD');
            req.flush(null, { status: 200, statusText: 'OK' });
        });

        it('should return true when API returns 404 (server responding)', (done) => {
            service.checkHealth().subscribe(isHealthy => {
                expect(isHealthy).toBe(true);
                done();
            });

            const req = httpMock.expectOne(`${environment.apiUrl}`);
            req.flush(null, { status: 404, statusText: 'Not Found' });
        });

        it('should return false when server is offline (status 0)', (done) => {
            service.checkHealth().subscribe(isHealthy => {
                expect(isHealthy).toBe(false);
                done();
            });

            const req = httpMock.expectOne(`${environment.apiUrl}`);
            req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });
        });

        it('should return false when server returns 503', (done) => {
            service.checkHealth().subscribe(isHealthy => {
                expect(isHealthy).toBe(false);
                done();
            });

            const req = httpMock.expectOne(`${environment.apiUrl}`);
            req.flush(null, { status: 503, statusText: 'Service Unavailable' });
        });
    });

    describe('getHealthStatus', () => {
        it('should return initial health status as healthy', (done) => {
            service.getHealthStatus().subscribe(status => {
                expect(status.isHealthy).toBe(true);
                expect(status.consecutiveFailures).toBe(0);
                done();
            });
        });

        it('should update health status on successful check', (done) => {
            let callCount = 0;
            service.getHealthStatus().subscribe(status => {
                callCount++;
                if (callCount === 2) {
                    expect(status.isHealthy).toBe(true);
                    expect(status.consecutiveFailures).toBe(0);
                    done();
                }
            });

            service.checkHealth().subscribe();
            const req = httpMock.expectOne(`${environment.apiUrl}`);
            req.flush(null, { status: 200, statusText: 'OK' });
        });

        it('should update health status on failed check', (done) => {
            let callCount = 0;
            service.getHealthStatus().subscribe(status => {
                callCount++;
                if (callCount === 2) {
                    expect(status.isHealthy).toBe(true); // Still healthy with 1 failure
                    expect(status.consecutiveFailures).toBe(1);
                    done();
                }
            });

            service.checkHealth().subscribe();
            const req = httpMock.expectOne(`${environment.apiUrl}`);
            req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });
        });
    });

    describe('getCurrentHealthStatus', () => {
        it('should return current health status synchronously', () => {
            const status = service.getCurrentHealthStatus();
            expect(status).toBeDefined();
            expect(status.isHealthy).toBe(true);
        });
    });

    describe('resetFailureCount', () => {
        it('should reset consecutive failures to 0', (done) => {
            // Primeiro, causa uma falha
            service.checkHealth().subscribe();
            const req1 = httpMock.expectOne(`${environment.apiUrl}`);
            req1.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

            setTimeout(() => {
                // Verifica que tem falha
                let status = service.getCurrentHealthStatus();
                expect(status.consecutiveFailures).toBe(1);

                // Reseta
                service.resetFailureCount();

                // Verifica que foi resetado
                status = service.getCurrentHealthStatus();
                expect(status.consecutiveFailures).toBe(0);
                done();
            }, 100);
        });
    });

    describe('forceCheck', () => {
        it('should perform immediate health check', (done) => {
            service.forceCheck().subscribe(isHealthy => {
                expect(isHealthy).toBe(true);
                done();
            });

            const req = httpMock.expectOne(`${environment.apiUrl}`);
            req.flush(null, { status: 200, statusText: 'OK' });
        });
    });

    describe('consecutive failures', () => {
        it('should mark as unhealthy after MAX_CONSECUTIVE_FAILURES', (done) => {
            let checkCount = 0;
            const maxFailures = 3;

            const performCheck = () => {
                service.checkHealth().subscribe(() => {
                    checkCount++;
                    if (checkCount < maxFailures) {
                        setTimeout(performCheck, 50);
                    } else {
                        const status = service.getCurrentHealthStatus();
                        expect(status.isHealthy).toBe(false);
                        expect(status.consecutiveFailures).toBe(maxFailures);
                        done();
                    }
                });

                const req = httpMock.expectOne(`${environment.apiUrl}`);
                req.error(new ProgressEvent('error'), { status: 503, statusText: 'Service Unavailable' });
            };

            performCheck();
        });

        it('should reset consecutive failures on successful check', (done) => {
            let checkCount = 0;

            // Primeira falha
            service.checkHealth().subscribe(() => {
                checkCount++;
                let status = service.getCurrentHealthStatus();
                expect(status.consecutiveFailures).toBe(1);

                // Sucesso - deve resetar
                service.checkHealth().subscribe(() => {
                    status = service.getCurrentHealthStatus();
                    expect(status.consecutiveFailures).toBe(0);
                    done();
                });

                const req2 = httpMock.expectOne(`${environment.apiUrl}`);
                req2.flush(null, { status: 200, statusText: 'OK' });
            });

            const req1 = httpMock.expectOne(`${environment.apiUrl}`);
            req1.error(new ProgressEvent('error'), { status: 503, statusText: 'Service Unavailable' });
        });
    });
});
