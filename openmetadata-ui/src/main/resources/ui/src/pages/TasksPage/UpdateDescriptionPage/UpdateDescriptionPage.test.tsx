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
import { act, fireEvent, render, screen } from '@testing-library/react';
import React, { forwardRef } from 'react';
import { MOCK_TASK_ASSIGNEE } from '../../../mocks/Task.mock';
import { postThread } from '../../../rest/feedsAPI';
import UpdateDescription from './UpdateDescriptionPage';

const mockUseHistory = {
  push: jest.fn(),
  goBack: jest.fn(),
};
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({ entityType: 'table' }),
  useLocation: jest
    .fn()
    .mockReturnValue({ search: '?field=columns&value=shop_id' }),
  useHistory: jest.fn().mockImplementation(() => mockUseHistory),
}));
jest.mock('../../../components/common/ResizablePanels/ResizablePanels', () =>
  jest.fn().mockImplementation(({ firstPanel, secondPanel }) => (
    <>
      <div>{firstPanel.children}</div>
      <div>{secondPanel.children}</div>
    </>
  ))
);
const mockTableData = {
  id: 'id1',
  name: 'dim_location',
  fullyQualifiedName: 'sample_data.ecommerce_db.shopify.dim_location',
  description:
    'This dimension table contains online shop information. This table contains one shop per row.',
  tableType: 'Regular',
  owner: {
    id: 'id1',
    name: 'sample_data',
    type: 'User',
  },
  columns: [
    {
      name: 'shop_id',
      dataType: 'NUMERIC',
      dataTypeDisplay: 'numeric',
      description:
        'Unique identifier for the store. This column is the primary key for this table.',
      fullyQualifiedName: 'sample_data.ecommerce_db.shopify."dim.shop".shop_id',
      tags: [],
      constraint: 'PRIMARY_KEY',
      ordinalPosition: 1,
    },
  ],
};
jest.mock('../../../utils/TasksUtils', () => ({
  fetchEntityDetail: jest
    .fn()
    .mockImplementation((_entityType, _decodedEntityFQN, setEntityData) => {
      setEntityData(mockTableData);
    }),
  fetchOptions: jest.fn(),
  getBreadCrumbList: jest.fn().mockReturnValue([]),
  getTaskMessage: jest.fn().mockReturnValue('Task message'),
  getEntityColumnsDetails: jest
    .fn()
    .mockImplementation(() => mockTableData.columns),
  getColumnObject: jest.fn().mockImplementation(() => ({
    description: mockTableData.columns[0].description,
  })),
  getTaskAssignee: jest.fn().mockReturnValue(MOCK_TASK_ASSIGNEE),
}));
jest.mock('../shared/Assignees', () =>
  jest.fn().mockImplementation(() => <div>Assignees.component</div>)
);
jest.mock(
  '../../../components/ExploreV1/ExploreSearchCard/ExploreSearchCard',
  () =>
    jest.fn().mockImplementation(() => <div>ExploreSearchCard.component</div>)
);
jest.mock(
  '../../../components/common/TitleBreadcrumb/TitleBreadcrumb.component',
  () => jest.fn().mockImplementation(() => <div>TitleBreadcrumb.component</div>)
);
jest.mock('../../../components/common/RichTextEditor/RichTextEditor', () =>
  forwardRef(
    jest.fn().mockImplementation(() => <div>RichTextEditor.component</div>)
  )
);
jest.mock('../../../rest/feedsAPI', () => ({
  postThread: jest.fn().mockResolvedValue({}),
}));
jest.mock('../../../hooks/useFqn', () => ({
  useFqn: jest
    .fn()
    .mockReturnValue({ fqn: 'sample_data.ecommerce_db.shopify.dim_location' }),
}));

describe('UpdateDescriptionPage', () => {
  it('should render component', async () => {
    render(<UpdateDescription />);

    expect(
      await screen.findByText('TitleBreadcrumb.component')
    ).toBeInTheDocument();
    expect(await screen.findByText('Assignees.component')).toBeInTheDocument();
    expect(
      await screen.findByText('RichTextEditor.component')
    ).toBeInTheDocument();
    expect(await screen.findByTestId('form-title')).toBeInTheDocument();
    expect(await screen.findByTestId('form-container')).toBeInTheDocument();
    expect(await screen.findByTestId('title')).toBeInTheDocument();
    expect(await screen.findByTestId('cancel-btn')).toBeInTheDocument();
    expect(await screen.findByTestId('submit-btn')).toBeInTheDocument();
  });

  it("should go back to previous page when 'Cancel' button is clicked", async () => {
    render(<UpdateDescription />);
    const cancelBtn = await screen.findByTestId('cancel-btn');

    act(() => {
      fireEvent.click(cancelBtn);
    });

    expect(mockUseHistory.goBack).toHaveBeenCalled();
  });

  it('should submit form when submit button is clicked', async () => {
    const mockPostThread = postThread as jest.Mock;
    render(<UpdateDescription />);
    const submitBtn = await screen.findByTestId('submit-btn');

    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(mockPostThread).toHaveBeenCalledWith({
      about:
        '<#E::table::sample_data.ecommerce_db.shopify.dim_location::columns::shop_id::description>',
      from: undefined,
      message: 'Task message',
      taskDetails: {
        assignees: [
          {
            id: 'id1',
            type: 'User',
          },
        ],
        oldValue:
          'Unique identifier for the store. This column is the primary key for this table.',
        suggestion:
          'Unique identifier for the store. This column is the primary key for this table.',
        type: 'UpdateDescription',
      },
      type: 'Task',
    });
  });
});
