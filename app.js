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

    let data = {
        items: {
            expense: [],
            income: []                
        },
        totals: {
            expense: 0,
            income: 0,
        }
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
                amount: document.getElementById('amount').value
            }
        },
        addListItems: function(obj, type) {
            let html, newHtml, element;

            if(type === 'income') {
                element = 'income-list';
                html = `
                <div class="has-text-success border-success columns is-mobile" id="income-%id%">
                    <div class="column margin-auto has-text-left">%description%</div>
                    <div class="column margin-auto has-text-left">%amount%</div>
                    <div class="column has-text-right">
                        <button class="button is-danger">
                            <i class="fas fa-window-close"></i>
                        </button>
                    </div>
                </div>`;
            } else if(type === 'expense') {
                element = 'expense-list';
                html = `<div class="has-text-danger border-danger columns is-mobile" id="expense-%id%">
                    <div class="column margin-auto has-text-left">%description%</div>
                    <div class="column margin-auto has-text-left">%amount%</div>                    
                    <div class="column has-text-right">
                        <button class="button is-danger">
                            <i class="fas fa-window-close"></i>
                        </button>
                    </div>
                </div>`;
            }

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%amount%', obj.amount);

            document.getElementById(element).insertAdjacentHTML('beforeend', newHtml);
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
    }

    let addItem = function() {
        let input, newItem;
        
        input = ui.getInput();
        
        newItem = budget.addNewItem(input.type,input.description,input.amount);

        ui.addListItems(newItem, input.type);
    };

    return {
        init: function() {
            setEventListeners();
        }
    }

})(budgetController, UIController);

appController.init();