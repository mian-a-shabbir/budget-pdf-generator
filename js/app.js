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

        getData: function() {
            return data;
        },

        testing: function() {
            console.log(data);
        },

    };

})();


let UIController = (function() {
    let myChart;
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
                <div class="border-grey item-list mx-5 br-6 columns is-mobile" id="income-%id%">
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
                html = `<div class="border-grey item-list mx-5 br-6 columns is-mobile" id="expense-%id%">
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

         buildChart: function(income,expense) {
            if (myChart) {
                myChart.destroy();
            }
            let ctx, labels, data, dataset;
            document.getElementById('pie-chart').style.visibility = 'visible';
            document.getElementById('pdf-gen').style.visibility = 'visible';
            ctx = document.getElementById('myChart').getContext('2d');
            labels = ['Income', 'Expense'];
            dataset = [income, expense];
            data = {
                labels: labels,
                datasets: [{
                    data: dataset,
                    backgroundColor: [
                        '#0b8793',
                        '#fe8c00'
                    ],
                    borderColor: [
                        '#6f0000',
                        '#6f0000'
                    ],
                    borderWidth: 1
                }]
            };

            myChart = new Chart(ctx, {
                type: 'pie',
                data: data,
                options: {
                    title: {
                        display: true,
                        text: 'Income vs Expense',
                        fontColor: 'black',
                        fontSize: 16
                    },
                    responsive: true,
                    legend: {
                        labels: {
                            fontColor: "black",
                            fontSize: 16
                        }
                    }
                }
            });

            myChart.update();
        },
    }
})();


let appController = (function(budget, ui) {

    let getDate = function() {
        let d,year,day,month,date; 

        d = new Date();
        year = d.getFullYear();
        day = d.getDate();
        month = d.getMonth() + 1;
        date = month + '-' + day + '-' + year;

        return date;
    };

    let setEventListeners = function() {
        document.querySelector('#add-btn').addEventListener('click',addItem);
        document.addEventListener('keypress', function(e) {
            if(e.keyCode === 13 || e.which === 13) {
                addItem();
            }
        });
        document.getElementById('lists-container').addEventListener('click', deleteItem);
        document.getElementById('pdf-gen').addEventListener('click',buildPDF);
    };

    let updateBudget = function() {
        budgetController.calculateBudget();
        let budget = budgetController.getBudget();
        ui.displayBudget(budget);
        ui.buildChart(budget.totalIncome,budget.totalExpense);
        console.log(budget.totalIncome,budget.totalExpense);
    };

    let addItem = function() {
        let input, newItem;
        
        input = ui.getInput();
        

        if(input.description !== "" && !isNaN(input.amount) && input.amount > 0) {
            newItem = budget.addNewItem(input.type,input.description,input.amount);
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

    let buildPDF = function() {
        let doc, html, pdfData;
        pdfData = budget.getData();
        html = '<style>tr{page-break-inside: avoid;}table{width:450px}thead{background-color:black}td{padding:6px}</style><table><thead><tr><td colspan="2" style="color:white;font-weight:600">Income</td></tr></thead>';
        pdfData.items.income.forEach(function(el) {
            html += '<tr><td>'+ el.description + '</td><td>' + el.amount + '</td></tr>'
        });
        html += '<tr><td><b>Total Income</b></td><td>'+ pdfData.totals.income + '</td></tr>';
        html += '<thead><tr><td colspan="2" style="color:white;font-weight:600">Expense</td></tr></thead>';
        pdfData.items.expense.forEach(function(el) {
            html += '<tr><td>'+ el.description + '</td><td>' + el.amount + '</td></tr>'
        });
        html += '<tr><td><b>Total Expenses</b></td><td>'+ pdfData.totals.expense + '</td></tr>';
        html += '<thead><tr><td style="color:white;font-weight:600">Balance</td><td style="color:white;font-weight:600">'+ pdfData.budget + '</td></tr></thead>';
        html += '<tr></tr>';
        html += '</table>';
        console.log(html);
        let e = document.createElement('div');
        e.innerHTML = '<img width="400" height="400" src="' + document.getElementById("myChart").toDataURL("image/png", 1.0) + '">' + html;
        let opt = {
            margin:       [0.5,2],
            filename:     'budget-'+ getDate() +'.pdf',
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' },
          };
        html2pdf(e, opt);
    };

    return {
        init: function() {
            document.getElementById('pie-chart').style.visibility = 'hidden';
            document.getElementById('pdf-gen').style.visibility = 'hidden';
            document.getElementById('date').textContent = getDate();
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