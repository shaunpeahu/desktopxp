import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { DesktopIcon } from '../DesktopIcon';

describe('DesktopIcon', () => {
  it('renders the label and calls onSelect when clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onOpen = vi.fn();

    render(
      <DesktopIcon
        id="test"
        icon={<span>ICON</span>}
        label="My Label"
        selected={false}
        onSelect={onSelect}
        onOpen={onOpen}
      />
    );

    expect(screen.getByText('My Label')).toBeInTheDocument();

    await user.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith('test');
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('calls onOpen when double clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onOpen = vi.fn();

    render(
      <DesktopIcon
        id="test"
        icon={<span>ICON</span>}
        label="My Label"
        selected={false}
        onSelect={onSelect}
        onOpen={onOpen}
      />
    );

    await user.dblClick(screen.getByRole('button'));
    expect(onOpen).toHaveBeenCalledOnce();
    expect(onOpen).toHaveBeenCalledWith('test');
  });
});
