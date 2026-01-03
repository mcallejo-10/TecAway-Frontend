/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactComponent } from './contact.component';
import { ContactService } from '../../services/contactService/contact.service';
import { UserService } from '../../services/userService/user.service';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';

describe('ContactComponent', () => {
    let component: ContactComponent;
    let fixture: ComponentFixture<ContactComponent>;
    let contactServiceMock: any;
    let userServiceMock: any;
    let toastrMock: any;
    let router: Router;

    const mockUserResponse = {
        data: {
            id_user: 123,
            name: 'John Doe',
            email: 'john@example.com',
            title: 'Software Developer with extensive experience',
            description: 'Expert in web development and cloud technologies'
        }
    };

    beforeEach(async () => {

        contactServiceMock = {
            sendMessage: jest.fn()
        };

        userServiceMock = {
            getUserById: jest.fn()
        };

        toastrMock = {
            success: jest.fn(),
            error: jest.fn()
        };

        await TestBed.configureTestingModule({
            imports: [ContactComponent],  // Importamos el componente (standalone)
            providers: [
                provideRouter([]),  // Necesario para que RouterLink funcione en el template
                { provide: ContactService, useValue: contactServiceMock },  // Reemplazamos servicios reales por mocks
                { provide: UserService, useValue: userServiceMock },
                { provide: ToastrService, useValue: toastrMock },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            paramMap: {
                                get: jest.fn().mockReturnValue('123')  // Simula que la URL tiene /contact/123
                            }
                        }
                    }
                }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ContactComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));

        // Configurar retorno por defecto para getUserById
        userServiceMock.getUserById.mockReturnValue(of(mockUserResponse));
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });


    describe('Constructor', () => {
        it('should extract id from route params', () => {
            expect(component.id).toBe(123);
        });
    });

    describe('Form validation', () => {
        it('should initialize with an empty form', () => {
            expect(component.registerForm.get('name')?.value).toBe('');
            expect(component.registerForm.get('email')?.value).toBe('');
            expect(component.registerForm.get('message')?.value).toBe('');
        });

        describe('name field', () => {
            it('should be invalid when empty', () => {
                const nameControl = component.registerForm.get('name');
                nameControl?.setValue('');
                expect(nameControl?.hasError('required')).toBe(true);
            });

            it('should be invalid when less than 2 characters', () => {
                const nameControl = component.registerForm.get('name');
                nameControl?.setValue('J');
                expect(nameControl?.hasError('minlength')).toBe(true);
            });

            it('should be invalid with numbers', () => {
                const nameControl = component.registerForm.get('name');
                nameControl?.setValue('John123');
                expect(nameControl?.hasError('pattern')).toBe(true);
            });

            it('should be valid with accented characters', () => {
                const nameControl = component.registerForm.get('name');
                nameControl?.setValue('José María');
                expect(nameControl?.valid).toBe(true);
            });
        });

        describe('email field', () => {
            it('should be invalid when empty', () => {
                const emailControl = component.registerForm.get('email');
                emailControl?.setValue('');
                expect(emailControl?.hasError('required')).toBe(true);
            });

            it('should be invalid with incorrect format', () => {
                const emailControl = component.registerForm.get('email');
                emailControl?.setValue('invalid-email');
                expect(emailControl?.hasError('email')).toBe(true);
            });

            it('should be valid with correct email format', () => {
                const emailControl = component.registerForm.get('email');
                emailControl?.setValue('test@example.com');
                expect(emailControl?.valid).toBe(true);
            });
        });

        describe('message field', () => {
            it('should be invalid when empty', () => {
                const messageControl = component.registerForm.get('message');
                messageControl?.setValue('');
                expect(messageControl?.hasError('required')).toBe(true);
            });

            it('should be invalid when less than 10 characters', () => {
                const messageControl = component.registerForm.get('message');
                messageControl?.setValue('Short');
                expect(messageControl?.hasError('minlength')).toBe(true);
            });

            it('should be valid with 10 or more characters', () => {
                const messageControl = component.registerForm.get('message');
                messageControl?.setValue('This is a valid message');
                expect(messageControl?.valid).toBe(true);
            });
        });
    });

    describe('ngOnInit', () => {
        it('should load technician data successfully', () => {
            fixture.detectChanges();

            expect(userServiceMock.getUserById).toHaveBeenCalledWith(123);
            expect(component.technician).toEqual(mockUserResponse.data);
        });

        it('should handle error when loading technician data', () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            const error = 'Failed to load user';
            userServiceMock.getUserById.mockReturnValue(throwError(() => error));

            fixture.detectChanges();

            expect(component.errorMessage).toBe('Error al obtener usuario');
            expect(consoleErrorSpy).toHaveBeenCalledWith('Error al obtener usuario:', error);

            consoleErrorSpy.mockRestore();
        });
    });

    describe('sendEmail', () => {
        beforeEach(() => {
            component.registerForm.patchValue({
                name: 'John Doe',
                email: 'john@example.com',
                message: 'This is a test message with enough characters'
            });
        });

        it('should send email successfully and navigate', () => {
            contactServiceMock.sendMessage.mockReturnValue(of(undefined));

            component.sendEmail();

            expect(contactServiceMock.sendMessage).toHaveBeenCalledWith({
                senderName: 'John Doe',
                senderEmail: 'john@example.com',
                message: 'This is a test message with enough characters',
                userId: 123
            });

            expect(toastrMock.success).toHaveBeenCalledWith('Email enviado correctamente');

            expect(router.navigate).toHaveBeenCalledWith(['/user', 123]);

            expect(component.errorMessage).toBe('');
        });

        it('should reset form after successful send', () => {
            contactServiceMock.sendMessage.mockReturnValue(of(undefined));

            component.sendEmail();

            expect(component.registerForm.get('name')?.value).toBeNull();
            expect(component.registerForm.get('email')?.value).toBeNull();
            expect(component.registerForm.get('message')?.value).toBeNull();
        });

        it('should handle error when sending email', () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            const error = new Error('Network error');
            contactServiceMock.sendMessage.mockReturnValue(throwError(() => error));

            component.sendEmail();

            expect(toastrMock.error).toHaveBeenCalledWith('Error al enviar el email');
            expect(component.errorMessage).toBe('Error al enviar el email');
            expect(consoleErrorSpy).toHaveBeenCalledWith('Error al enviar el email', error);

            consoleErrorSpy.mockRestore();
        });

        it('should not send email if form is invalid', () => {
            component.registerForm.patchValue({
                name: '',
                email: 'john@example.com',
                message: 'Valid message'
            });

            component.sendEmail();

            expect(contactServiceMock.sendMessage).not.toHaveBeenCalled();
        });
    });
});
