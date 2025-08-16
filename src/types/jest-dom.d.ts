import "@testing-library/jest-dom"

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveClass(...classes: string[]): R
      toHaveAttribute(attr: string, value?: string): R
      toBeEnabled(): R
      toBeDisabled(): R
      toBeVisible(): R
      toBeChecked(): R
      toHaveValue(value: any): R
      toHaveTextContent(text: string | RegExp): R
      toHaveFocus(): R
      toBeRequired(): R
      toBeValid(): R
      toBeInvalid(): R
    }
  }
}
