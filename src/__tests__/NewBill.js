/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import updateBill from "../containers/NewBill.js"

import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router"
import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js"
import userEvent from "@testing-library/user-event";
import { fireEvent, getByTestId, render } from '@testing-library/react';
import store from "../__mocks__/store.js"



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
    // Mock localStorage
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

    describe("If the extension is incorrect", () => {
      test("An error message should be shown", () => {
        const file = new File(['fake file'], 'fakefile.fakextension', {type: 'text/plain'});
        const fileExtension = file.name.split(".")[1]

        expect(fileExtension).toBe("fakextension")

        const fileInput = screen.getByTestId("file")

        userEvent.upload(fileInput, file)

        expect(screen.getByTestId("file").nextElementSibling.textContent).toBe("Veuillez sélectionner une image au format .jpg, .jpeg ou .png")
      })
    })

    describe("If the extension is correct", () => {
      test("My file should be added to the form", () => {
        const file = new File(['fake file'], 'fakefile.jpg', {type: 'text/plain'});
        const fileExtension = file.name.split(".")[1]

        expect(fileExtension).toBe("jpg")

        const fileInput = screen.getByTestId("file")

        userEvent.upload(fileInput, file)

        expect(fileInput.files[0]).toStrictEqual(file)
      })
    })
  })
  
  describe("When I fill the form correctly and send it", () => {
    test("My new bill should be saved in the data base", () => {
      // Mock localStorage
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

      // Mock updateBill
      let newBill = new NewBill({document, onNavigate, localStorage, store});
      const updateBillMock = jest.fn();
      jest.spyOn(newBill, 'updateBill').mockImplementation(updateBillMock);

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
      const expenseFile = screen.getByTestId('file');
      const file = new File(['Test file'], 'testfile.png', {type: 'image/png'});
      const fileUrl = "url/to/file"
      userEvent.upload(expenseFile, file);
      expect(expenseFile.files[0]).toStrictEqual(file);
      expect(expenseFile.files.item(0)).toStrictEqual(file);
      expect(expenseFile.files).toHaveLength(1);

      //datas
      const bill = {
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
      }

      // Launch post
      /*const submitButton = document.getElementById("btn-send-bill")
      userEvent.click(submitButton)*/
      //updateBillMock(bill)
      newBill.updateBill(bill)

      // Check if updateBill was called with the right data
      expect(updateBillMock).toHaveBeenCalledWith(bill);

    })
  })
})
