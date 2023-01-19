// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import Flashbar from '../../../lib/components/flashbar';
import { createFlashbarWrapper } from './common';
import createWrapper, { FlashbarWrapper } from '../../../lib/components/test-utils/dom';
import { FlashbarProps, StackedFlashbarProps } from '../interfaces';
import { render } from '@testing-library/react';
import { warnOnce } from '../../../lib/components/internal/logging';

jest.mock('../../../lib/components/internal/logging', () => ({
  warnOnce: jest.fn(),
}));

afterEach(() => {
  (warnOnce as jest.Mock).mockReset();
});

const sampleItems: Record<string, FlashbarProps.MessageDefinition> = {
  error: { type: 'error', header: 'Error', content: 'There was an error', ariaRole: 'alert' },
  success: { type: 'success', header: 'Success', content: 'Everything went fine' },
};

const defaultStrings = {
  ariaLabel: 'Notifications',
  toggleButtonText: 'Notifications',
  toggleButtonAriaLabel: 'View all notifications',
  errorCountAriaLabel: 'Error',
  warningCountAriaLabel: 'Warning',
  successCountAriaLabel: 'Success',
  infoCountAriaLabel: 'Information',
  inProgressCountAriaLabel: 'In progress',
};

const defaultItems = [sampleItems.error, sampleItems.success];

const defaultProps = {
  collapsible: true,
  i18nStrings: defaultStrings,
};

describe('Collapsible Flashbar', () => {
  describe('Basic behavior', () => {
    it('shows only the header and content of the last item in the array when collapsed', () => {
      const flashbar = renderFlashbar();
      const items = flashbar.findItems();
      expect(items.length).toBe(1);
      expect(items[0].findHeader()!.getElement()).toHaveTextContent('Success');
      expect(items[0].findContent()!.getElement()).toHaveTextContent('Everything went fine');
    });

    it('shows toggle element with desired text', () => {
      const customToggleButtonText = 'Custom text';
      const flashbar = renderFlashbar({
        i18nStrings: {
          toggleButtonText: customToggleButtonText,
        },
      });
      const toggleElement = findOuterToggleElement(flashbar);
      expect(toggleElement).toBeTruthy();
      expect(toggleElement).toHaveTextContent(customToggleButtonText);
    });

    it('does not show toggle element if there is only one item', () => {
      const flashbar = renderFlashbar({ items: [{ type: 'error' }] });
      expect(findOuterToggleElement(flashbar)).toBeFalsy();
    });

    it('expands and collapses by clicking on toggle element', () => {
      const flashbar = renderFlashbar();
      const items = flashbar.findItems();
      expect(items.length).toBe(1);
      expect(items[0].findHeader()!.getElement()).toHaveTextContent('Success');
      expect(items[0].findContent()!.getElement()).toHaveTextContent('Everything went fine');

      findOuterToggleElement(flashbar)!.click();

      const expandedItems = flashbar.findItems();
      expect(expandedItems.length).toBe(2);
      expect(expandedItems[0].findHeader()!.getElement()).toHaveTextContent('Success');
      expect(expandedItems[0].findContent()!.getElement()).toHaveTextContent('Everything went fine');
      expect(expandedItems[1].findHeader()!.getElement()).toHaveTextContent('Error');
      expect(expandedItems[1].findContent()!.getElement()).toHaveTextContent('There was an error');

      findOuterToggleElement(flashbar)!.click();

      const collapsedItems = flashbar.findItems();
      expect(collapsedItems.length).toBe(1);
      expect(collapsedItems[0].findHeader()!.getElement()).toHaveTextContent('Success');
      expect(collapsedItems[0].findContent()!.getElement()).toHaveTextContent('Everything went fine');
    });

    it('collapses automatically when enough items are added', () => {
      const item1 = { ...sampleItems.success, id: '0' };
      const item2 = { ...sampleItems.error, id: '1' };

      const { container, rerender } = render(
        <Flashbar items={[item1]} {...{ collapsible: true, i18nStrings: defaultStrings }} />
      );
      const wrapper = createWrapper(container);
      const flashbar = wrapper.findFlashbar()!;
      expect(flashbar.findItems()).toHaveLength(1);
      expect(findOuterToggleElement(flashbar)).toBeFalsy();

      rerender(<Flashbar items={[item1, item2]} {...{ collapsible: true, i18nStrings: defaultStrings }} />);
      expect(wrapper.findFlashbar()!.findItems()).toHaveLength(1);
      const toggleElement = findOuterToggleElement(wrapper.findFlashbar()!);
      expect(toggleElement).toBeTruthy();
    });

    it('collapses automatically again when enough items are added even if it had been expanded before', () => {
      const item1 = { ...sampleItems.success, id: '0' };
      const item2 = { ...sampleItems.error, id: '1' };

      const { container, rerender } = render(
        <Flashbar items={[item1, item2]} {...{ collapsible: true, i18nStrings: defaultStrings }} />
      );
      const wrapper = createWrapper(container);
      const flashbar = wrapper.findFlashbar()!;
      expect(flashbar.findItems()).toHaveLength(1);
      expect(findOuterToggleElement(flashbar)).toBeTruthy();
      const toggleElement = findOuterToggleElement(wrapper.findFlashbar()!);
      expect(toggleElement).toBeTruthy();
      toggleElement!.click();
      expect(flashbar.findItems()).toHaveLength(2);

      rerender(<Flashbar items={[item1]} {...{ collapsible: true, i18nStrings: defaultStrings }} />);
      expect(wrapper.findFlashbar()!.findItems()).toHaveLength(1);
      expect(findOuterToggleElement(wrapper.findFlashbar()!)).toBeFalsy();

      rerender(<Flashbar items={[item1, item2]} {...{ collapsible: true, i18nStrings: defaultStrings }} />);
      expect(wrapper.findFlashbar()!.findItems()).toHaveLength(1);
      expect(findOuterToggleElement(wrapper.findFlashbar()!)).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('renders items in an unordered list', () => {
      const flashbar = renderFlashbar();
      const list = flashbar.find('ul')!;
      expect(list).toBeTruthy();
      expect(list.findAll('li')).toHaveLength(2);
    });

    it('applies ARIA label to the unordered list', () => {
      const customAriaLabel = 'Custom text';
      const flashbar = renderFlashbar({
        i18nStrings: {
          ariaLabel: customAriaLabel,
        },
      });
      const list = findList(flashbar)!;
      expect(list).toBeTruthy();
      expect(list.getElement().getAttribute('aria-label')).toEqual(customAriaLabel);
    });

    it('hides collapsed items from the accessibility tree', () => {
      const flashbar = renderFlashbar();
      const accessibleItems = flashbar
        .findAll('li')
        .filter(item => item.getElement().getAttribute('aria-hidden') !== 'true');
      expect(accessibleItems.length).toBe(1);
    });

    it('does not render outer toggle element as HTML button element', () => {
      const flashbar = renderFlashbar();
      const toggle = findOuterToggleElement(flashbar);
      expect(toggle!.tagName).not.toEqual('BUTTON');
    });

    it('applies desired ARIA label to toggle element', () => {
      const customToggleButtonAriaLabel = 'Custom toggle button ARIA label';
      const flashbar = renderFlashbar({
        i18nStrings: {
          toggleButtonAriaLabel: customToggleButtonAriaLabel,
        },
      });
      const button = findInnerToggleButton(flashbar);
      expect(button).toHaveAttribute('aria-label', customToggleButtonAriaLabel);
    });

    it('applies aria-expanded attribute to toggle button', () => {
      const flashbar = renderFlashbar();
      const button = findInnerToggleButton(flashbar)!;
      expect(button).toHaveAttribute('aria-expanded', 'false');

      button.click();
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('applies aria-controls attribute to toggle button referring to the unordered list', () => {
      const flashbar = renderFlashbar();
      const listId = findList(flashbar)!.getElement().id;
      expect(listId).toBeTruthy();
      const button = findInnerToggleButton(flashbar);
      expect(button).toHaveAttribute('aria-controls', listId);
    });

    it('applies aria-describedby attribute to the list, referencing the item counter', () => {
      const flashbar = renderFlashbar();
      const list = findList(flashbar)!;
      expect(list).toBeTruthy();
      const itemCounterElementId = findInnerCounterElement(flashbar)!.id;
      expect(itemCounterElementId).toBeTruthy();
      expect(list.getElement()).toHaveAttribute('aria-describedby', itemCounterElementId);
    });

    it('does not apply aria-describedby to the list when the toggle element is not rendered', () => {
      const flashbar = renderFlashbar({ items: [sampleItems.error] });
      const list = findList(flashbar)!;
      expect(list).toBeTruthy();
      const itemCounterElement = findInnerCounterElement(flashbar);
      expect(itemCounterElement).toBeUndefined();
      expect(list.getElement()).not.toHaveAttribute('aria-describedby');
    });

    it('applies aria-describedby to the toggle button, referencing the item counter', () => {
      const flashbar = renderFlashbar();
      const itemCounterElementId = findInnerCounterElement(flashbar)!.id;
      expect(itemCounterElementId).toBeTruthy();
      const toggleButton = findInnerToggleButton(flashbar);
      expect(toggleButton).toHaveAttribute('aria-describedby', itemCounterElementId);
    });

    it('announces updates to the item counter with aria-live', () => {
      const flashbar = renderFlashbar();
      const counter = findOuterCounter(flashbar)!.getElement();
      expect(counter).toHaveAttribute('aria-live', 'polite');
    });

    it('renders the toggle element header as H2 element', () => {
      const customToggleButtonText = 'Custom text';
      const flashbar = renderFlashbar({
        i18nStrings: {
          toggleButtonText: customToggleButtonText,
        },
      });
      const h2 = findOuterToggleElement(flashbar)!.querySelector('h2');
      expect(h2).toHaveTextContent(customToggleButtonText);
    });

    it('applies ARIA labels and title attributes to the item counter', () => {
      const customLabels = {
        errorCountAriaLabel: 'Custom error ARIA label',
        successCountAriaLabel: 'Custom success ARIA label',
        infoCountAriaLabel: 'Custom info ARIA label',
        inProgressCountAriaLabel: 'Custom progress ARIA label',
        warningCountAriaLabel: 'Custom warning ARIA label',
      };
      const flashbar = renderFlashbar({ i18nStrings: { ...customLabels } });
      const innerCounter = findInnerCounterElement(flashbar);
      for (const ariaLabel of Object.values(customLabels)) {
        const labeledElement = innerCounter!.querySelector(`[aria-label="${ariaLabel}"]`);
        expect(labeledElement).toBeTruthy();
        expect(labeledElement).toHaveAttribute('title', ariaLabel);
      }
    });
  });

  describe('i18n', () => {
    it('warns if i18nStrings object is not provided', () => {
      render(<Flashbar items={defaultItems} {...{ collapsible: true }} />);
      expect(warnOnce).toHaveBeenCalledTimes(1);
      expect(warnOnce).toHaveBeenCalledWith(
        'Flashbar',
        'Using the `collapsible` option requires passing an `i18nStrings` object.'
      );
    });

    it('warns if some string is missing', () => {
      const strings = {
        ariaLabel: defaultStrings.ariaLabel,
        toggleButtonAriaLabel: defaultStrings.toggleButtonAriaLabel,
        toggleButtonText: defaultStrings.toggleButtonText,
        successCountAriaLabel: defaultStrings.successCountAriaLabel,
        errorCountAriaLabel: defaultStrings.errorCountAriaLabel,
        warningCountAriaLabel: defaultStrings.warningCountAriaLabel,
        inProgressCountAriaLabel: defaultStrings.inProgressCountAriaLabel,
      };
      render(<Flashbar items={defaultItems} {...{ collapsible: true }} i18nStrings={strings} />);
      expect(warnOnce).toHaveBeenCalledTimes(1);
      expect(warnOnce).toHaveBeenCalledWith(
        'Flashbar',
        'Using the `collapsible` option requires passing a `infoCountAriaLabel` parameter inside the `i18nStrings` object.'
      );
    });

    it('does not warn if all ARIA labels and i18n strings are provided', () => {
      render(<Flashbar items={defaultItems} {...{ collapsible: true }} i18nStrings={defaultStrings} />);
      expect(warnOnce).not.toHaveBeenCalled();
    });
  });
});

function findList(flashbar: FlashbarWrapper) {
  return flashbar.find('ul');
}

// Entire interactive element including the counter and the actual <button/> element
function findOuterToggleElement(flashbar: FlashbarWrapper): HTMLElement | undefined {
  const element = Array.from(flashbar.getElement().children).find(
    element => element instanceof HTMLElement && element.tagName !== 'UL'
  );
  if (element) {
    return element as HTMLElement;
  }
}

// Actual <button/> element inside the toggle element
function findInnerToggleButton(flashbar: FlashbarWrapper): HTMLElement | undefined {
  return findOuterToggleElement(flashbar)?.querySelector('button') || undefined;
}

// Item counter including the header
function findOuterCounter(flashbar: FlashbarWrapper) {
  return flashbar.find('[role="status"]');
}

// Inner counter including only the icons and the number of items for each type
function findInnerCounterElement(flashbar: FlashbarWrapper) {
  const outerCounter = findOuterCounter(flashbar);
  if (outerCounter) {
    const element = Array.from(outerCounter.getElement().children).find(
      element => element instanceof HTMLElement && element.tagName !== 'H2'
    );
    if (element) {
      return element as HTMLElement;
    }
  }
}

function renderFlashbar(
  customProps: Partial<
    Omit<StackedFlashbarProps, 'i18nStrings' | 'collapsible'> & {
      i18nStrings?: Partial<StackedFlashbarProps.I18nStrings>;
    }
  > = {
    items: defaultItems,
  }
) {
  const { items, ...restProps } = customProps;
  const props = { ...defaultProps, ...restProps, i18nStrings: { ...defaultStrings, ...restProps.i18nStrings } };
  return createFlashbarWrapper(<Flashbar {...props} items={items || defaultItems} />);
}
