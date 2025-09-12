import { render, screen } from '@testing-library/react';
import Header from './Header';

describe('Header Component', () => {
  it('should render the default BIOPARK title when no prop is passed', () => {
    render(<Header />);
    expect(screen.getByText(/BIOPARK/i)).toBeInTheDocument();
  });

  // A new test for a custom title
  it('should render a custom title when the prop is provided', () => {
    const customTitle = 'My Dashboard';
    render(<Header title={customTitle} />);

    // Check that the custom title is there
    expect(screen.getByText(customTitle)).toBeInTheDocument();

    // Check that the default title is NOT there
    // (We use 'queryByText' to check for absence, as 'getByText' would throw an error)
    expect(screen.queryByText(/BIOPARK/i)).not.toBeInTheDocument();
  });
});
