/*
 *  Copyright 2022 Collate.
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

import { Card, Space, Table, Typography } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { AxiosError } from 'axios';
import PageHeader from 'components/header/PageHeader.component';
import { isEmpty } from 'lodash';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getAggregateChartData } from 'rest/DataInsightAPI';
import {
  formatDateTimeWithTimezone,
  formatTimeDurationFromSeconds,
} from 'utils/date-time/DateTimeUtils';
import { getUserPath } from '../../constants/constants';
import { DataReportIndex } from '../../generated/dataInsight/dataInsightChart';
import { DataInsightChartType } from '../../generated/dataInsight/dataInsightChartResult';
import { MostActiveUsers } from '../../generated/dataInsight/type/mostActiveUsers';
import { ChartFilter } from '../../interface/data-insight.interface';
import { showErrorToast } from '../../utils/ToastUtils';
import ProfilePicture from '../common/ProfilePicture/ProfilePicture';
import './DataInsightDetail.less';
import { EmptyGraphPlaceholder } from './EmptyGraphPlaceholder';

interface Props {
  chartFilter: ChartFilter;
}

const TopActiveUsers: FC<Props> = ({ chartFilter }) => {
  const [mostActiveUsers, setMostActiveUsers] = useState<MostActiveUsers[]>();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { t } = useTranslation();

  const fetchMostActiveUsers = async () => {
    setIsLoading(true);
    try {
      const params = {
        ...chartFilter,
        dataInsightChartName: DataInsightChartType.MostActiveUsers,
        dataReportIndex: DataReportIndex.WebAnalyticUserActivityReportDataIndex,
      };
      const response = await getAggregateChartData(params);

      setMostActiveUsers(response.data ?? []);
    } catch (error) {
      showErrorToast(error as AxiosError);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMostActiveUsers();
  }, [chartFilter]);

  const columns: ColumnsType<MostActiveUsers> = useMemo(
    () => [
      {
        title: t('label.user'),
        dataIndex: 'userName',
        key: 'userName',
        render: (userName: string) => (
          <Space>
            <ProfilePicture id="" name={userName} type="circle" width="24" />
            <Link to={getUserPath(userName)}>{userName}</Link>
          </Space>
        ),
      },
      {
        title: t('label.team'),
        dataIndex: 'team',
        key: 'team',
        render: (team: string) => (
          <Typography.Text>{team ?? '--'}</Typography.Text>
        ),
      },
      {
        title: t('label.most-recent-session'),
        dataIndex: 'lastSession',
        key: 'lastSession',
        render: (lastSession: number) => (
          <Typography.Text>
            {formatDateTimeWithTimezone(lastSession)}
          </Typography.Text>
        ),
      },
      {
        title: t('label.total-entity', {
          entity: t('label.session-plural'),
        }),
        dataIndex: 'sessions',
        key: 'sessions',
        render: (sessions: number) => (
          <Typography.Text>{sessions}</Typography.Text>
        ),
      },
      {
        title: t('label.average-session'),
        dataIndex: 'avgSessionDuration',
        key: 'avgSessionDuration',
        render: (avgSessionDuration: number) => (
          <Typography.Text>
            {formatTimeDurationFromSeconds(avgSessionDuration)}
          </Typography.Text>
        ),
      },
    ],
    []
  );

  return (
    <Card
      className="data-insight-card"
      data-testid="entity-summary-card-percentage"
      loading={isLoading}
      title={
        <PageHeader
          data={{
            header: t('label.data-insight-active-user-summary'),
            subHeader: t('message.most-active-users'),
          }}
        />
      }>
      {isEmpty(mostActiveUsers) ? (
        <EmptyGraphPlaceholder />
      ) : (
        <Table
          className="data-insight-table-wrapper"
          columns={columns}
          dataSource={mostActiveUsers}
          pagination={false}
          size="small"
        />
      )}
    </Card>
  );
};

export default TopActiveUsers;
