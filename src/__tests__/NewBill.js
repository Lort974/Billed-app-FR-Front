/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import updateBill from "../containers/NewBill.js"

import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import Logout from "./Logout.js"
import userEvent from "@testing-library/user-event";
import { fireEvent, getByTestId, render } from '@testing-library/react';
import store from "../__mocks__/store.js"

import { bills } from "../fixtures/bills"



describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the new bill form should be shown", () => {
      /*const html = NewBillUI()
      document.body.innerHTML = html*/
      //to-do write assertion

      // Mock localStorage
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
      }))

      // Create root div and append to body
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)

      // Start router
      router()

      // Simulate navigation to NewBill page
      window.onNavigate(ROUTES_PATH.NewBill)


      // select form
      const formNewBill = screen.getByTestId("form-new-bill")

      // Check if the form is shown
      expect(formNewBill).toBeTruthy()
    })
  })
  describe("When I pick a file", () => {
    test("Then the file change should be handled correctly", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
  
      // Create root div and append to body
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
  
      // Start router
      router()
  
      // Simulate navigation to NewBill page
      window.onNavigate(ROUTES_PATH.NewBill)
      
      document.body.innerHTML = NewBillUI()
  
      const newbill = new NewBill({
        document, onNavigate, store: null, localStorage: window.localStorage
      })
  
      const handleChangeFile = jest.fn((e) => newbill.handleChangeFile(e))
  
      const fileInput = screen.getByTestId("file")
  
      const file = new File(['fake file'], 'fakefile.fakextension', {type: 'text/plain'});
      const fileExtension = file.name.split(".")[1]
  
      expect(fileExtension).toBe("fakextension")
  
      fileInput.addEventListener('change', handleChangeFile)
      userEvent.upload(fileInput, file)
  
      expect(handleChangeFile).toHaveBeenCalled()
    })
  })
  
  describe("When I fill the form correctly and send it", () => {
    test("My new bill should be saved in the data base", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'employee@test.tld'
      }))
      console.log(JSON.parse(localStorage.getItem("user")))
  
      // Create root div and append to body
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
  
      // Start router
      router()
  
      // Simulate navigation to NewBill page
      window.onNavigate(ROUTES_PATH.NewBill)
      
      document.body.innerHTML = NewBillUI()
  
      const mockStore = {
        bills: jest.fn().mockReturnValue({
          list: jest.fn().mockResolvedValue([]), // retourne une promesse résolue avec un tableau vide
          create: jest.fn().mockResolvedValue({fileUrl: 'url/to/file', key: 'key'}), // retourne une promesse résolue avec un objet
          update: jest.fn().mockResolvedValue({data: 'data', selector: 'selector'}),
        }),
        then: jest.fn(),
      };

      const newbill = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })

      // Mock functions
      //const updateBill = jest.fn((e) => newbill.updateBill());

      // Espionnez la méthode updateBill de l'instance
      jest.spyOn(newbill, 'updateBill');

      const handleSubmit = jest.fn((e) => newbill.handleSubmit(e))
      const formNewBill = screen.getByTestId("form-new-bill")
      const submitButton = screen.getByRole('button', { name: /Envoyer/i })
  
      submitButton.addEventListener('click', handleSubmit)


      // Simulate fields completion and check it
      //expense type
      const expenseType = screen.getByTestId("expense-type")
      const officeSupplies = screen.getByText("Fournitures de bureau")
      userEvent.selectOptions(expenseType, officeSupplies)
      expect(officeSupplies.selected).toBe(true)
      //expense name
      const expenseName = screen.getByTestId("expense-name")
      userEvent.type(expenseName, "Nom de test")
      expect(expenseName.value).toBe("Nom de test")
      //expense date
      const expenseDate = screen.getByTestId("datepicker")
      fireEvent.change(expenseDate, { target: { value: '2023-11-27' } })
      expect(expenseDate.value).toBe("2023-11-27")
      //expense amount
      const expenseAmount = screen.getByTestId("amount")
      userEvent.type(expenseAmount, "12")
      expect(expenseAmount.value).toBe("12")
      //expense VAT amount
      const vatAmount = screen.getByTestId("vat")
      userEvent.type(vatAmount, "2")
      expect(vatAmount.value).toBe("2")
      //expense VAT rate
      const vatRate = screen.getByTestId("pct")
      userEvent.type(vatRate, "20")
      expect(vatRate.value).toBe("20")
      //expense commentary
      const commentary = screen.getByTestId("commentary")
      userEvent.type(commentary, "Ceci est une note de frais de test")
      expect(commentary.value).toBe("Ceci est une note de frais de test")
      //expense file

      //SIMULER LE CHANGEMENT DE FICHIER
      const handleChangeFile = jest.fn((e) => newbill.handleChangeFile(e))
  
      const fileInput = screen.getByTestId("file")
  
      const file = new File(['Test file'], 'testfile.png', {type: 'image/png'});
  
      fileInput.addEventListener('change', handleChangeFile)
      userEvent.upload(fileInput, file)
  
      expect(handleChangeFile).toHaveBeenCalled()



      expect(fileInput.files[0]).toStrictEqual(file);
      expect(fileInput.files.item(0)).toStrictEqual(file);
      expect(fileInput.files).toHaveLength(1);

      //datas
      /*const bill = {
        email: 'employee@test.tld',
        type: screen.getByTestId("expense-type").value,
        name:  screen.getByTestId("expense-name").value,
        amount: parseInt(screen.getByTestId("amount").value),
        date:  screen.getByTestId("datepicker").value,
        vat: screen.getByTestId("vat").value,
        pct: parseInt(screen.getByTestId("pct").value) || 20,
        commentary: screen.getByTestId("commentary").value,
        fileUrl: fileUrl,
        fileName: file,
        status: 'pending'
      }*/

      //console.log(bill)

      // Launch post
      /*const submitButton = document.getElementById("btn-send-bill")
      userEvent.click(submitButton)*/
      //updateBillMock(bill)
      //updateBill()
      //userEvent.click(submitButton)
      fireEvent.submit(formNewBill)

      // Check if updateBill was called with the right data
      expect(newbill.updateBill).toHaveBeenCalled();

    })
  })
})
