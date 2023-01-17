// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import Flashbar from '../../../lib/components/flashbar';
import { render } from './common';
import { FlashbarWrapper } from '../../../lib/components/test-utils/dom';
import { FlashbarProps, StackedFlashbarProps } from '../interfaces';

const sampleItems: Record<string, FlashbarProps.MessageDefinition> = {
  error: { type: 'error', header: 'Error', content: 'There was an error' },
  success: { type: 'success', header: 'Success', content: 'Everything went fine' },
};

describe('Collapsible Flashbar', () => {
  describe('Basic behavior', () => {
    it('shows only the header and content of the last item in the array when collapsed', () => {
      const wrapper = render(<Flashbar {...{ stackItems: true }} items={[sampleItems.error, sampleItems.success]} />);
      const items = wrapper.findItems();
      expect(items.length).toBe(1);
      expect(items[0].findHeader()!.getElement()).toHaveTextContent('Success');
      expect(items[0].findContent()!.getElement()).toHaveTextContent('Everything went fine');
    });

    it('shows toggle element with desired text', () => {
      const wrapper = render(
        <Flashbar
          {...{
            stackItems: true,
            i18nStrings: {
              toggleButtonText: 'Custom text',
              toggleButtonAriaLabel: 'Collapsed ARIA label',
            },
          }}
          items={[sampleItems.error, sampleItems.success]}
        />
      );
      const button = findToggleElement(wrapper);
      expect(button).toBeTruthy();
      expect(button).toHaveTextContent('Custom text');
    });

    it('does not show toggle element if there is only one item', () => {
      const wrapper = render(<Flashbar {...{ stackItems: true }} items={[{ type: 'error' }]} />);
      expect(findToggleElement(wrapper)).toBeFalsy();
    });

    it('expands and collapses by clicking on toggle element', () => {
      const wrapper = render(
        <Flashbar
          {...{
            stackItems: true,
          }}
          items={[sampleItems.error, sampleItems.success]}
        />
      );
      const items = wrapper.findItems();
      expect(items.length).toBe(1);
      expect(items[0].findHeader()!.getElement()).toHaveTextContent('Success');
      expect(items[0].findContent()!.getElement()).toHaveTextContent('Everything went fine');

      findToggleElement(wrapper)!.click();

      const expandedItems = wrapper.findItems();
      expect(expandedItems.length).toBe(2);
      expect(expandedItems[0].findHeader()!.getElement()).toHaveTextContent('Success');
      expect(expandedItems[0].findContent()!.getElement()).toHaveTextContent('Everything went fine');
      expect(expandedItems[1].findHeader()!.getElement()).toHaveTextContent('Error');
      expect(expandedItems[1].findContent()!.getElement()).toHaveTextContent('There was an error');

      findToggleElement(wrapper)!.click();

      const collapsedItems = wrapper.findItems();
      expect(collapsedItems.length).toBe(1);
      expect(collapsedItems[0].findHeader()!.getElement()).toHaveTextContent('Success');
      expect(collapsedItems[0].findContent()!.getElement()).toHaveTextContent('Everything went fine');
    });
  });

  describe('Accessibility', () => {
    it('renders items in an unordered list', () => {
      const wrapper = render(
        <Flashbar
          {...{
            stackItems: true,
            i18nStrings: {
              toggleButtonText: 'Custom text',
              toggleButtonAriaLabel: 'Toggle button ARIA label',
            },
          }}
          items={[sampleItems.error, sampleItems.success]}
        />
      );
      const list = wrapper.find('ul')!;
      expect(list).toBeTruthy();
      expect(list.findAll('li')).toHaveLength(2);
    });

    it('applies ARIA label to the unordered list', () => {
      const expectedAriaLabel = 'Custom text';
      const wrapper = render(
        <Flashbar
          {...{
            stackItems: true,
            i18nStrings: {
              ariaLabel: expectedAriaLabel,
            },
          }}
          items={[sampleItems.error, sampleItems.success]}
        />
      );
      const list = wrapper.find('ul')!;
      expect(list).toBeTruthy();
      expect(list.getElement().getAttribute('aria-label')).toEqual(expectedAriaLabel);
    });

    it('hides collapsed items from the accessibility tree', () => {
      const findAccessibleListItems = (wrapper: FlashbarWrapper) =>
        wrapper.findAll('li').filter(item => item.getElement().getAttribute('aria-hidden') !== 'true');

      const wrapper = render(<Flashbar {...{ stackItems: true }} items={[sampleItems.error, sampleItems.success]} />);
      const items = findAccessibleListItems(wrapper);
      expect(items.length).toBe(1);
    });

    it('applies desired ARIA label to toggle button', () => {
      const wrapper = render(
        <Flashbar
          {...{
            stackItems: true,
            i18nStrings: {
              toggleButtonText: 'Custom text',
              toggleButtonAriaLabel: 'Toggle button ARIA label',
            },
          }}
          items={[sampleItems.error, sampleItems.success]}
        />
      );
      const button = findToggleButtonElement(wrapper);
      expect(button).toHaveAttribute('aria-label', 'Toggle button ARIA label');
    });

    it('applies aria-expanded attribute to toggle button', () => {
      const wrapper = render(
        <Flashbar
          {...{
            stackItems: true,
            i18nStrings: {
              toggleButtonText: 'Custom text',
              toggleButtonAriaLabel: 'Toggle button ARIA label',
            },
          }}
          items={[sampleItems.error, sampleItems.success]}
        />
      );
      const button = findToggleButtonElement(wrapper)!;
      expect(button).toHaveAttribute('aria-expanded', 'false');

      button.click();
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('applies aria-controls attribute to toggle button referring to the unordered list', () => {
      const wrapper = render(
        <Flashbar
          {...{
            stackItems: true,
            i18nStrings: {
              toggleButtonText: 'Custom text',
              toggleButtonAriaLabel: 'Toggle button ARIA label',
            },
          }}
          items={[sampleItems.error, sampleItems.success]}
        />
      );
      const listId = wrapper.find('ul')!.getElement().id;
      expect(listId).toBeTruthy();
      const button = findToggleButtonElement(wrapper);
      expect(button).toHaveAttribute('aria-controls', listId);
    });

    it('applies aria-describedby attribute to the list, referencing the item counter', () => {
      const expectedAriaLabel = 'Custom text';
      const wrapper = render(
        <Flashbar
          {...{
            stackItems: true,
            i18nStrings: {
              ariaLabel: expectedAriaLabel,
            },
          }}
          items={[sampleItems.error, sampleItems.success]}
        />
      );
      const list = wrapper.find('ul')!;
      expect(list).toBeTruthy();
      const itemCountId = findItemCounter(wrapper)!.getElement().id;
      expect(itemCountId).toBeTruthy();
      expect(list.getElement().getAttribute('aria-describedby')).toEqual(itemCountId);
    });
  });

  it('announces updates to the item counter with aria-live', () => {
    const flashbar = renderFlashbar();
    const counter = findItemCounter(flashbar)!.getElement();
    expect(counter).toHaveAttribute('aria-live', 'polite');
  });
});

function findToggleElement(flashbar: FlashbarWrapper): HTMLElement | undefined {
  const element = Array.from(flashbar.getElement().children).find(
    element => element instanceof HTMLElement && element.tagName !== 'UL'
  );
  if (element) {
    return element as HTMLElement;
  }
}

function findToggleButtonElement(flashbar: FlashbarWrapper): HTMLElement | undefined {
  return findToggleElement(flashbar)?.querySelector('button') || undefined;
}

function findItemCounter(flashbar: FlashbarWrapper) {
  return flashbar.find('[role="status"]');
}

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

const defaultProps = {
  stackItems: true,
  i18nStrings: defaultStrings,
};

function renderFlashbar(
  customProps: Omit<StackedFlashbarProps, 'stackItems'> = {
    items: [sampleItems.error, sampleItems.success],
  }
) {
  const { items, ...restProps } = customProps;
  const props = { ...defaultProps, ...restProps, i18nStrings: { ...defaultStrings, ...restProps.i18nStrings } };
  return render(<Flashbar {...props} items={items} />);
}
