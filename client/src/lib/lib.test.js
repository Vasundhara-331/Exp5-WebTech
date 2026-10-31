import { describe, it, expect } from 'vitest';
import { validateRegister, validateLogin, validateFeedback } from './validation';
import { seatsLabel, seatsLeft, formatEventDate } from './format';

describe('validateRegister', () => {
  it('accepts a valid user', () => {
    expect(validateRegister({ name: 'Asha', email: 'asha@example.com', password: 'Secret123' })).toEqual({});
  });

  it('flags short names, bad emails and weak passwords', () => {
    const errors = validateRegister({ name: 'A', email: 'nope', password: 'password' });
    expect(Object.keys(errors).sort()).toEqual(['email', 'name', 'password']);
  });
});

describe('validateLogin', () => {
  it('requires email and password', () => {
    expect(validateLogin({ email: '', password: '' })).toHaveProperty('password');
  });
});

describe('validateFeedback', () => {
  it('limits length and rating', () => {
    expect(validateFeedback({ message: 'Great fest!', rating: 5 })).toEqual({});
    expect(validateFeedback({ message: 'x'.repeat(501), rating: 0 })).toHaveProperty('rating');
  });
});

describe('format helpers', () => {
  it('reports seats left', () => {
    expect(seatsLeft({ capacity: 10, registeredCount: 4 })).toBe(6);
    expect(seatsLabel({ capacity: 10, registeredCount: 10 })).toBe('Full');
    expect(seatsLabel({ capacity: 100, registeredCount: 95 })).toBe('Only 5 seats left');
  });

  it('formats dates in IST', () => {
    expect(formatEventDate('2026-12-11T09:00:00+05:30')).toMatch(/11 Dec/);
  });
});
