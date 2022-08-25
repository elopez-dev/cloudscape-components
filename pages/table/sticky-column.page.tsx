// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import Button from '~components/button';
import Table from '~components/table';
import SpaceBetween from '~components/space-between';
import Box from '~components/box';
import Header from '~components/header';
import ScreenshotArea from '../utils/screenshot-area';

export default () => {
  const [stickies, setStickies] = React.useState<string[]>([]);

  const getStickies = (id: string) => {
    let arr = [...stickies];

    if (stickies.includes(id)) {
      arr = arr.filter(i => i !== id);
      setStickies(arr);
    } else if (!stickies.includes(id)) {
      setStickies([...stickies, id]);
    }
  };

  const getButton = (id: string) => {
    return (
      <Button
        variant="icon"
        onClick={() => getStickies(id)}
        iconName={stickies.includes(id) ? 'unlocked' : 'lock-private'}
      />
    );
  };

  console.log(stickies);
  return (
    <ScreenshotArea>
      <SpaceBetween size="xl">
        <Table
          stickyHeader
          columnDefinitions={[
            {
              id: 'variable',
              header: 'Variable name',
              cell: item => item.name || '-',
              sortingField: 'name',
              width: '300px',
              minWidth: '300px',
              maxWidth: '300px',
              isSticky: true,
            },
            {
              id: 'alt',
              header: 'Text value',
              cell: item => item.alt || '-',
              sortingField: 'alt',
            },
            {
              id: 'description',
              header: 'Description',
              cell: item => item.description || '-',
            },
            {
              id: 'description-2',
              header: 'Description',
              cell: item => item.description || '-',
            },
            {
              id: 'description-3',
              header: 'Description',
              cell: item => item.description || '-',
            },
            {
              id: 'description-4',
              header: 'Description',
              cell: item => item.description || '-',
            },
            {
              id: 'description-5',
              header: 'Description',
              cell: item => item.description || '-',
            },
            {
              id: 'description-6',
              header: 'Description',
              cell: item => item.description || '-',
            },
            {
              id: 'descriptio7',
              header: 'Description',
              cell: item => item.description || '-',
            },
          ]}
          items={[
            {
              name: 'Item 1',
              alt: 'First',
              description: 'This is the first item',
              type: '1A',
              size: 'Small',
            },
            {
              name: 'Item 2',
              alt: 'Second',
              description: 'This is the second item',
              type: '1B',
              size: 'Large',
            },
            {
              name: 'Item 3',
              alt: 'Third',
              description: '-',
              type: '1A',
              size: 'Large',
            },
            {
              name: 'Item 4',
              alt: 'Fourth',
              description: 'This is the fourth item',
              type: '2A',
              size: 'Small',
            },
            {
              name: 'Item 5',
              alt: '-',
              description: 'This is the fifth item with a longer description',
              type: '2A',
              size: 'Large',
            },
            {
              name: 'Item 6',
              alt: 'Sixth',
              description: 'This is the sixth item',
              type: '1A',
              size: 'Small',
            },
          ]}
          loadingText="Loading resources"
          sortingDisabled={true}
          empty={
            <Box textAlign="center" color="inherit">
              <b>No resources</b>
              <Box padding={{ bottom: 's' }} variant="p" color="inherit">
                No resources to display.
              </Box>
              <Button>Create resource</Button>
            </Box>
          }
          header={<Header>Table with sticky column and sticky header</Header>}
        />
        <Table
          columnDefinitions={[
            {
              id: 'variable',
              header: 'Variable name',
              cell: item => item.name || '-',
              sortingField: 'name',
              width: '300px',
              minWidth: '300px',
              maxWidth: '300px',
              isSticky: true,
            },
            {
              id: 'alt',
              header: 'Text value',
              cell: item => item.alt || '-',
              sortingField: 'alt',
              isSticky: true,
            },
            {
              id: 'description',
              header: 'Description',
              cell: item => item.description || '-',
              isSticky: true,
            },
            {
              id: 'description-2',
              header: 'Description',
              cell: item => item.description || '-',
            },
            {
              id: 'description-3',
              header: 'Description',
              cell: item => item.description || '-',
            },
            {
              id: 'description-4',
              header: 'Description',
              cell: item => item.description || '-',
            },
            {
              id: 'description-5',
              header: 'Description',
              cell: item => item.description || '-',
            },
            {
              id: 'description-6',
              header: 'Description',
              cell: item => item.description || '-',
            },
            {
              id: 'descriptio7',
              header: 'Description',
              cell: item => item.description || '-',
            },
          ]}
          items={[
            {
              name: 'Item 1',
              alt: 'First',
              description: 'This is the first item',
              type: '1A',
              size: 'Small',
            },
            {
              name: 'Item 2',
              alt: 'Second',
              description: 'This is the second item',
              type: '1B',
              size: 'Large',
            },
            {
              name: 'Item 3',
              alt: 'Third',
              description: '-',
              type: '1A',
              size: 'Large',
            },
            {
              name: 'Item 4',
              alt: 'Fourth',
              description: 'This is the fourth item',
              type: '2A',
              size: 'Small',
            },
            {
              name: 'Item 5',
              alt: '-',
              description: 'This is the fifth item with a longer description',
              type: '2A',
              size: 'Large',
            },
            {
              name: 'Item 6',
              alt: 'Sixth',
              description: 'This is the sixth item',
              type: '1A',
              size: 'Small',
            },
          ]}
          loadingText="Loading resources"
          sortingDisabled={true}
          empty={
            <Box textAlign="center" color="inherit">
              <b>No resources</b>
              <Box padding={{ bottom: 's' }} variant="p" color="inherit">
                No resources to display.
              </Box>
              <Button>Create resource</Button>
            </Box>
          }
          header={<Header>Table with 3 sticky columns</Header>}
        />
        <Table
          resizableColumns
          columnDefinitions={[
            {
              id: 'variable',
              header: (
                <Box fontWeight="bold" color="text-body-secondary">
                  Variable name {getButton('variable')}
                </Box>
              ),
              cell: item => item.name || '-',
              sortingField: 'name',
              width: '300px',
              minWidth: '300px',
              maxWidth: '300px',
              isSticky: stickies.includes('variable'),
            },
            {
              id: 'alt',
              header: (
                <Box fontWeight="bold" color="text-body-secondary">
                  Text value {getButton('alt')}
                </Box>
              ),
              cell: item => item.alt || '-',
              width: '300px',
              minWidth: '300px',
              maxWidth: '300px',
              sortingField: 'alt',
              isSticky: stickies.includes('alt'),
            },
            {
              id: 'description',
              header: (
                <Box fontWeight="bold" color="text-body-secondary">
                  Description {getButton('description')}
                </Box>
              ),
              cell: item => item.description || '-',
              isSticky: stickies.includes('description'),
            },
            {
              id: 'description-2',
              header: (
                <Box fontWeight="bold" color="text-body-secondary">
                  Description {getButton('description-2')}
                </Box>
              ),
              cell: item => item.description || '-',
              isSticky: stickies.includes('description-2'),
            },
            {
              id: 'description-3',
              header: (
                <Box fontWeight="bold" color="text-body-secondary">
                  Description {getButton('description-3')}
                </Box>
              ),
              cell: item => item.description || '-',
              isSticky: stickies.includes('description-3'),
            },
            {
              id: 'description-4',
              header: (
                <Box fontWeight="bold" color="text-body-secondary">
                  Description {getButton('description-4')}
                </Box>
              ),
              cell: item => item.description || '-',
              isSticky: stickies.includes('description-4'),
            },
            {
              id: 'description-5',
              header: (
                <Box fontWeight="bold" color="text-body-secondary">
                  Description {getButton('description-5')}
                </Box>
              ),
              cell: item => item.description || '-',
              isSticky: stickies.includes('description-5'),
            },
            {
              id: 'description-6',
              header: (
                <Box fontWeight="bold" color="text-body-secondary">
                  Description {getButton('description-6')}
                </Box>
              ),
              cell: item => item.description || '-',
              isSticky: stickies.includes('description-6'),
            },
            {
              id: 'description-7',
              header: (
                <Box fontWeight="bold" color="text-body-secondary">
                  Description {getButton('description-7')}
                </Box>
              ),
              cell: item => item.description || '-',
              isSticky: stickies.includes('description-7'),
            },
          ]}
          items={[
            {
              name: 'Item 1',
              alt: 'First',
              description: 'This is the first item',
              type: '1A',
              size: 'Small',
            },
            {
              name: 'Item 2',
              alt: 'Second',
              description: 'This is the second item',
              type: '1B',
              size: 'Large',
            },
            {
              name: 'Item 3',
              alt: 'Third',
              description: '-',
              type: '1A',
              size: 'Large',
            },
            {
              name: 'Item 4',
              alt: 'Fourth',
              description: 'This is the fourth item',
              type: '2A',
              size: 'Small',
            },
            {
              name: 'Item 5',
              alt: '-',
              description: 'This is the fifth item with a longer description',
              type: '2A',
              size: 'Large',
            },
            {
              name: 'Item 6',
              alt: 'Sixth',
              description: 'This is the sixth item',
              type: '1A',
              size: 'Small',
            },
          ]}
          loadingText="Loading resources"
          sortingDisabled={true}
          empty={
            <Box textAlign="center" color="inherit">
              <b>No resources</b>
              <Box padding={{ bottom: 's' }} variant="p" color="inherit">
                No resources to display.
              </Box>
              <Button>Create resource</Button>
            </Box>
          }
          header={<Header>Table with dynamic sticky columns and resizable columns</Header>}
        />
      </SpaceBetween>
    </ScreenshotArea>
  );
};