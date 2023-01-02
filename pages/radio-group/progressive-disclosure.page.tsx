// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useState } from 'react';
import Box from '~components/box';
import FormField from '~components/form-field';
import RadioGroup from '~components/radio-group';
import Select, { SelectProps } from '~components/select';

const languageOptions: Array<SelectProps.Option> = [
  { value: 'en', label: 'English' },
  { value: 'de', label: 'German' },
  { value: 'en', label: 'Spanish' },
];

export default function RadiosPage() {
  const [value, setValue] = useState('');
  const [language, setLanguage] = useState(languageOptions[0]);

  return (
    <Box padding="l">
      <h1>Radio group progressive disclosure demo</h1>
      <FormField
        label="Language settings"
        description="You can select a specific language or have this service automatically identify the language in your media."
      >
        <RadioGroup
          value={value}
          onChange={event => setValue(event.detail.value)}
          items={[
            {
              label: 'Specific language',
              value: 'specific',
              description:
                'If you know the language spoken in the source media, choose this option for optimal results.',
              secondaryContent: value === 'specific' && (
                <FormField label="Language">
                  <Select
                    options={languageOptions}
                    selectedOption={language}
                    onChange={({ detail }) => setLanguage(detail.selectedOption)}
                  />
                </FormField>
              ),
            },
            {
              label: 'Automatic language detection',
              value: 'automatic',
              description: 'If you do not know the language spoken in the source media, choose this option.',
            },
          ]}
        />
      </FormField>
    </Box>
  );
}
