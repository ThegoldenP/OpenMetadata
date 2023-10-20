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

import {
  deleteCreatedService,
  goToAddNewServicePage,
  testServiceCreationAndIngestion,
  updateDescriptionForIngestedTables,
  uuid,
} from '../../common/common';
import { API_SERVICE, SERVICE_TYPE } from '../../constants/constants';

const serviceType = 'Superset';
const serviceName = `${serviceType}-ct-test-${uuid()}`;
const tableName = "World Bank's Data";
const description = `This is ${serviceName} description`;

describe('Superset Ingestion', () => {
  beforeEach(() => {
    cy.login();
  });

  it('add and ingest data', () => {
    goToAddNewServicePage(SERVICE_TYPE.Dashboard);

    // Select Dashboard services
    cy.get('[data-testid="service-category"]').should('be.visible').click();
    cy.get('.ant-select-item-option-content')
      .contains('Dashboard Services')
      .click();

    const connectionInput = () => {
      cy.get('#root\\/connection\\/username')
        .scrollIntoView()
        .type(Cypress.env('supersetUsername'));
      cy.get('#root\\/connection\\/authType\\/password')
        .scrollIntoView()
        .type(Cypress.env('supersetPassword'));
      cy.get('#root\\/connection\\/hostPort')
        .scrollIntoView()
        .focus()
        .clear()
        .type(Cypress.env('supersetHostPort'));
      cy.get('#root\\/connection\\/database').scrollIntoView().type('superset');
    };

    const addIngestionInput = () => {
      cy.get('#root\\/dashboardFilterPattern\\/includes')
        .scrollIntoView()

        .type(`${tableName}{enter}`);
    };

    testServiceCreationAndIngestion({
      serviceType,
      connectionInput,
      addIngestionInput,
      serviceName,
      type: 'dashboard',
      serviceCategory: SERVICE_TYPE.Dashboard,
    });
  });

  it('Update table description and verify description after re-run', () => {
    updateDescriptionForIngestedTables(
      serviceName,
      tableName,
      description,
      SERVICE_TYPE.Dashboard,
      'dashboards'
    );
  });

  it('delete created service', () => {
    deleteCreatedService(
      SERVICE_TYPE.Dashboard,
      serviceName,
      API_SERVICE.dashboardServices
    );
  });
});
