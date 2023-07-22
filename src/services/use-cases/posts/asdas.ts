class Employee {

    constructor(name: string) {
        // @ts-ignore
        this.employeeName = name
    }

    greet() {
        // @ts-ignore
        console.log(`Good Morning ${this.employeeName}`)
    }

}

let employee = new Employee('Ossama')

employee.greet()