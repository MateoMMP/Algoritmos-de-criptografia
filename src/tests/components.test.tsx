import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../app/App';

afterEach(cleanup);

describe('aplicación', () => {
  it('abre una lección con teoría y laboratorio', () => {
    render(
      <MemoryRouter initialEntries={['/bloque/1/01-escitala-lacedemonia-estricta']}>
        <App />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole('heading', { name: 'Escítala lacedemonia estricta' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Cómo funciona' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cifrar/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Marcar como completada' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Aprender' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reiniciar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Copiar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Compartir' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Aleatorio' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Texto' })).not.toBeInTheDocument();
    expect(screen.queryByText(/Explora el concepto, modifica/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Usa ahora el laboratorio/)).not.toBeInTheDocument();
    expect(screen.queryByText(/En examen, escribe primero/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Preset del temario editable/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^Cifrar$/ }));
    expect(screen.queryByRole('heading', { name: 'Comprobación' })).not.toBeInTheDocument();
  });
  it('dibuja la matriz real de la escítala', () => {
    render(
      <MemoryRouter initialEntries={['/bloque/1/01-escitala-lacedemonia-estricta']}>
        <App />
      </MemoryRouter>,
    );
    const message = 'HOLA ME LLAMO MATEO Y SOY EL MEJOR DEL MUNDO MUNDIAL';
    fireEvent.change(screen.getByLabelText('Mensaje o valor'), { target: { value: message } });
    fireEvent.click(screen.getByRole('button', { name: /^Cifrar$/ }));
    expect(screen.getByLabelText(/Visualización de Escítala/)).toBeInTheDocument();
    expect(
      screen.getByText(
        `4 × ${Math.ceil(message.length / 4)} = ${Math.ceil(message.length / 4) * 4} celdas`,
      ),
    ).toBeInTheDocument();
  });
  it('restaura ejemplo y clave al cambiar de lección', () => {
    render(
      <MemoryRouter initialEntries={['/bloque/1/01-escitala-lacedemonia-estricta']}>
        <App />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText(/Clave o parámetros/), { target: { value: '99' } });
    fireEvent.click(screen.getByRole('link', { name: /Escítala general/ }));
    expect(screen.getByLabelText(/Clave o parámetros/)).toHaveValue('3');
    expect(screen.getByLabelText('Mensaje o valor')).toHaveValue('TRANSPOCISION');
  });
});
