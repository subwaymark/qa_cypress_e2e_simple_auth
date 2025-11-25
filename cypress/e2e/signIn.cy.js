/// <reference types="cypress" />

import {
  chooseRandomFromArray,
  listOfRedColor,
  convertRGBTo255,
  basicRedShades
} from '../support/e2e';

describe('Sign In page', {
  viewportHeight: 1000,
  viewportWidth: 1400,
  scrollBehavior: 'bottom'
},
() => {
  const validUsername = 'tomsmith';
  const validPassword = 'SuperSecretPassword!';

  it('should provide an ability to log in', () => {
    const runOption = Math.floor(Math.random() + 0.5); // log in by label or not
    let usernameField;
    let passwordField;
    let usernameLabel;
    let passwordLabel;

    cy.visit('/login')
      .then(() => cy.document())
      .then((doc) => {
        usernameField = doc.querySelector('input[id="username"]');
        passwordField = doc.querySelector('input[id="password"]');

        if (usernameField) {
          usernameLabel = doc.querySelector(`label[for="${usernameField.name}"]`);
        }
        if (passwordField) {
          passwordLabel = doc.querySelector(`label[for="${passwordField.name}"]`);
        }

        return doc;
      })
      .then((doc) => {
        if (runOption === 0 && usernameLabel && passwordLabel) {
          cy.get(usernameLabel)
            .type(`${validUsername}`);
          cy.get(passwordLabel)
            .type(`${validPassword}`);
          cy.get('button[type="submit"]')
            .contains('Login')
            .click();
        } else {
          cy.get(usernameField)
            .type(`${validUsername}`);
          cy.get(passwordField)
            .type(`${validPassword}`);
          cy.get('button[type="submit"]')
            .contains('Login')
            .click();
        }

        cy.location('href')
          .should('equal', 'https://the-internet.herokuapp.com/secure');
      });
  });

  it(`should not allowed to log in when credential are ` +
    `inconsistent with requirements`, () => {
    const runOption = Math.floor(Math.random() + 0.5);
    let usernameField;
    let passwordField;
    let usernameLabel;
    let passwordLabel;

    cy.visit('/login')
      .then(() => cy.document())
      .then((doc) => {
        usernameField = doc.querySelector('input[id="username"]');
        passwordField = doc.querySelector('input[id="password"]');

        if (usernameField) {
          usernameLabel = doc.querySelector(`label[for="${usernameField.name}"]`);
        }
        if (passwordField) {
          passwordLabel = doc.querySelector(`label[for="${passwordField.name}"]`);
        }

        return doc;
      })
      .then((doc) => {
        const invalidUsername =
          chooseRandomFromArray(['boLekKolek32', 'Mini%43', 'mmmKuet*##']);
        const invalidPassword =
          chooseRandomFromArray(['brrrBUM!', 'kocccccs)99', 'HsdWWWDDPP']);

        if (runOption === 0 && usernameLabel && passwordLabel) {
          cy.get(usernameLabel)
            .type(`${invalidUsername}`);
          cy.get(passwordLabel)
            .type(`${invalidPassword}`);
          cy.get('button[type="submit"]')
            .contains('Login')
            .click();
        } else {
          cy.get(usernameField)
            .type(`${invalidUsername}`);
          cy.get(passwordField)
            .type(`${invalidPassword}`);
          cy.get('button[type="submit"]')
            .contains('Login')
            .click();
        }

        cy.location('href')
          .should('equal', 'https://the-internet.herokuapp.com/login');

        cy.get('[class="flash error"]')
          .should('be.visible')
          .then((error) => {
            const element = error[0];
            const elementStyle = getComputedStyle(element);
            const elementText = element.textContent;
            const backgroundColor = elementStyle.backgroundColor;

            if (backgroundColor.startsWith('rgb')) {
              const colorComponents = backgroundColor.match(/\d+/g);
              const newRGBFormat = convertRGBTo255(
                +colorComponents[0],
                +colorComponents[1],
                +colorComponents[2]
              );
              const [r, g, b] = newRGBFormat;
              const haveRedVariant = basicRedShades.some((redVariant) => {
                const [r2, g2, b2] = redVariant;

                return r === r2 && g === g2 && b === b2;
              });

              // eslint-disable-next-line no-unused-expressions
              expect(haveRedVariant, 'Error message has red background color')
                .to.be.true;
            } else {
              expect(backgroundColor, 'Error message has red background color')
                .to.be.oneOf(listOfRedColor);
            }

            expect(elementText, 'Error message has text (at least 2 words with 2+ letters)').to.match(/(\b\w{2,}\b ){2,}/);
          });
      });
  });

  it('should provide an ability to log out', () => {
    cy.visit({
      method: 'POST',
      url: 'https://the-internet.herokuapp.com/authenticate',
      body: {
        username: validUsername,
        password: validPassword
      }
    })
      .then(() => {
        cy.get('[href*="/logout"]')
          .contains('Logout')
          .click();

        return cy.location('href');
      })
      .then((location) => {
        expect(location).to.equal('https://the-internet.herokuapp.com/login');
      });
  });
});
