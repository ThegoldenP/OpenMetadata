/*
 *  Copyright 2024 Collate.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { Button, Card, Col, Form, Row, Typography } from 'antd';
import { isEmpty, isNil } from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CreateEventSubscription } from '../../../generated/events/api/createEventSubscription';
import { listLengthValidator } from '../../../utils/Alerts/AlertsUtil';
import './destination-form-item.less';
import DestinationSelectItem from './DestinationSelectItem/DestinationSelectItem';

function DestinationFormItem({
  heading,
  subHeading,
  buttonLabel,
}: Readonly<{
  heading: string;
  subHeading: string;
  buttonLabel: string;
}>) {
  const { t } = useTranslation();
  const form = Form.useFormInstance();

  const [selectedSource] =
    Form.useWatch<CreateEventSubscription['resources']>(['resources'], form) ??
    [];

  return (
    <Card className="alert-form-item-container">
      <Row gutter={[8, 8]}>
        <Col span={24}>
          <Typography.Text className="font-medium">{heading}</Typography.Text>
        </Col>
        <Col span={24}>
          <Typography.Text className="text-xs text-grey-muted">
            {subHeading}
          </Typography.Text>
        </Col>
        <Col span={24}>
          <Form.List
            name={['destinations']}
            rules={[
              {
                validator: listLengthValidator(t('label.destination')),
              },
            ]}>
            {(fields, { add, remove }, { errors }) => {
              return (
                <Row
                  data-testid="destination-list"
                  gutter={[16, 16]}
                  key="destinations">
                  {fields.map(({ key, name }) => (
                    <DestinationSelectItem
                      id={name}
                      key={key}
                      remove={remove}
                      selectorKey={key}
                    />
                  ))}

                  <Col span={24}>
                    <Button
                      data-testid="add-destination-button"
                      disabled={
                        isEmpty(selectedSource) || isNil(selectedSource)
                      }
                      type="primary"
                      onClick={() => add({})}>
                      {buttonLabel}
                    </Button>
                  </Col>

                  <Col span={24}>
                    <Form.ErrorList errors={errors} />
                  </Col>
                </Row>
              );
            }}
          </Form.List>
        </Col>
      </Row>
    </Card>
  );
}

export default DestinationFormItem;
