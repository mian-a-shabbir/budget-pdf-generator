let budgetController = (function() {

    let Expense = function(id, description, amount) {
        this.id = id;
        this.description = description;
        this.amount = amount
    };

    let Income = function(id, description, amount) {
        this.id = id;
        this.description = description;
        this.amount = amount;
    };

    let calculateTotal = function(type) {
        let sum = 0;
        data.items[type].forEach(function(el) {
            sum += el.amount;
        });
        data.totals[type] = sum;
    };

    let data = {
        items: {
            expense: [],
            income: []                
        },
        totals: {
            expense: 0,
            income: 0,
        },
        budget: 0,
        percentage: -1
    };

    return {
        addNewItem: function(type, desc, amt) {
            let newItem, id;
            if (data.items[type].length > 0) {
                id = data.items[type][data.items[type].length - 1].id + 1;
            } else {
                id = 0;
            }

            if(type === 'expense') {
                newItem = new Expense(id,desc,amt);
            } else if (type === 'income') {
                newItem = new Income(id, desc, amt);
            }

            data.items[type].push(newItem);

            return newItem;
        },

        deleteItem: function(type, id) {
            let ids, index;
            ids = data.items[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1) {
                data.items[type].splice(index, 1);
            }

        },

        calculateBudget: function() {
            calculateTotal('expense');
            calculateTotal('income');

            data.budget = data.totals.income - data.totals.expense;
            if(data.totals.income > 0) {
                data.percentage = Math.round((data.totals.expense / data.totals.income) * 100);
            } else {
                data.percentage = -1;
            }

        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalIncome: data.totals.income,
                totalExpense: data.totals.expense,
                percentage: data.percentage
            }
        },

        testing: function() {
            console.log(data);
        }
    };

})();


let UIController = (function() {
    
    return {
        getInput: function() {
            return {
                type: document.getElementById('amount-type').value,
                description: document.getElementById('description').value,
                amount: parseFloat(document.getElementById('amount').value)
            }
        },
        addListItems: function(obj, type) {
            let html, newHtml, element;

            if(type === 'income') {
                element = 'list-income';
                html = `
                <div class="has-text-success border-success columns is-mobile" id="income-%id%">
                    <div class="column is-6 margin-auto has-text-left">%description%</div>
                    <div class="column is-3 margin-auto has-text-left">%amount%</div>
                    <div class="column is-3 margin-auto">
                        <button class="button is-small is-danger">
                            x
                        </button>
                    </div>
                </div>`;
            } else if(type === 'expense') {
                element = 'list-expense';
                html = `<div class="has-text-danger border-danger columns is-mobile" id="expense-%id%">
                    <div class="column is-6 margin-auto has-text-left">%description%</div>
                    <div class="column is-3 margin-auto has-text-left">%amount%</div>                    
                    <div class="column is-3 margin-auto">
                        <button class="button is-small is-danger">
                            x
                        </button>
                    </div>
                </div>`;
            }

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%amount%', obj.amount);

            document.getElementById(element).insertAdjacentHTML('beforeend', newHtml);
         },

         deleteListItem: function(selectorID) {
             let el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
         },

         clearFields: function() {
             document.getElementById('description').value = '';
             document.getElementById('amount').value = '';
             document.getElementById('description').focus();             
         },

         displayBudget: function(obj) {
            document.getElementById('total-budget').textContent = obj.budget;
            document.getElementById('total-income').textContent = obj.totalIncome;
            document.getElementById('total-expense').textContent = obj.totalExpense;

            if(obj.percentage > 0) {
                document.getElementById('total-percentage').textContent = obj.percentage + '%';
            } else {
                document.getElementById('total-percentage').textContent = '---';
            }
         },
    }
})();


let appController = (function(budget, ui) {

    let setEventListeners = function() {
        document.querySelector('#add-btn').addEventListener('click',addItem);
        document.addEventListener('keypress', function(e) {
            if(e.keyCode === 13 || e.which === 13) {
                addItem();
            }
        });
        document.getElementById('lists-container').addEventListener('click', deleteItem);
    }

    let updateBudget = function() {
        budgetController.calculateBudget();

        let budget = budgetController.getBudget();

        ui.displayBudget(budget);
    };

    let addItem = function() {
        let input, newItem;
        
        input = ui.getInput();
        
        newItem = budget.addNewItem(input.type,input.description,input.amount);

        if(input.description !== "" && !isNaN(input.amount) && input.amount > 0) {
            ui.addListItems(newItem, input.type);
            ui.clearFields();
            updateBudget();
        }
    };

    let deleteItem = function(e) {
        let itemID, splitID, type, ID;

        itemID = e.target.parentNode.parentNode.id;
        if(itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            if(type === "income" || type === "expense"){
                budget.deleteItem(type, ID);
                ui.deleteListItem(itemID);
                updateBudget();
            }

        }
    };

    return {
        init: function() {
            setEventListeners();
            ui.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpense: 0,
                percentage: -1
            });
        }
    }

})(budgetController, UIController);

appController.init();