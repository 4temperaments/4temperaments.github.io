let shuffledQuestions;

$(document).ready(function() {
    $('#resultchart').hide();
    $('#choleric').hide();
    $('#sanguine').hide();
    $('#melancholic').hide();
    $('#phlegmatic').hide();

    // Fetch and load the quiz questions using jQuery's $.getJSON()
    $.getJSON('assets/questions.json', function(questions) {
        const quizContainer = $('#questions');

        // Shuffle the questions using sort and Math.random
        shuffledQuestions = questions.sort(() => Math.random() - 0.5);

        // Loop through the questions and append them to the container
        shuffledQuestions.forEach(function(question, index) {
            const questionDiv = $('<div class="question col-md-12 mb-5 lead"></div>');
            questionDiv.html(`
                <label class="form-label">${index + 1}. ${question.question}</label><br>
                ${question.options.map(option => `
                    <label>
                        <input type="radio" name="${question.id}" value="${option.value}" required> ${option.label}
                    </label><br>
                `).join('')}
            `);
            quizContainer.append(questionDiv);
        });
    }).fail(function() {
        alert('Error loading the quiz questions.');
    });

    // Handle form submission
    $('#submitQuiz').on('click', function(e) {
        e.preventDefault(); // Prevent form submission
    
        let allAnswered = true;
        let scores = {
            Extraversion: 5,
            Neuroticism: -10
        };
    
        // Collect answers
        // for (let idx = 0; idx < shuffledQuestions.length; idx++) {
        //     const question = shuffledQuestions[idx];
        //     const selected = $(`input[name="${question.id}"]:checked`).val();
        //     if (!selected) {
        //         allAnswered = false;
        //         alert('Question #' + (idx + 1) + ' is not yet answered. Please answer all the questions before submitting.');
        //         break;
        //     } else {
        //         scores[question.category] += parseInt(selected); // Add score to the relevant category
        //     }
        // };
    
        // if (!allAnswered) {
        //     // Return if not all questions are answered
        //     return;
        // }

        // Neuroticism is reversed. (Neuroticism > 0 means High emotional stability)
        if (scores.Extraversion > 0 && scores.Neuroticism > 0) {
            $('#sanguine').show();
        } else if (scores.Extraversion > 0 && scores.Neuroticism < 0) {
            $('#choleric').show();
        } else if (scores.Extraversion < 0 && scores.Neuroticism > 0) {
            $('#phlegmatic').show();
        } else if (scores.Extraversion < 0 && scores.Neuroticism < 0) {
            $('#melancholic').show();
        }

        // Prepare results chart
        const rad = 5 * Math.max(Math.abs(scores.Extraversion), Math.abs(scores.Neuroticism));
    
        // Generate the chart with the results
        generateTemperamentChart(scores.Extraversion, scores.Neuroticism, rad);

        // Display results
        $('#resultchart').show();

        // Update form
        document.getElementById('submitButton').classList.remove('disabled');
        updateForm();
    });

    (function() {
        // https://dashboard.emailjs.com/admin/account
        emailjs.init({
          publicKey: "ANW_yC-Ql6mJg5xhu",
        });
    })();
    // Form submission handler
    document.getElementById('contactForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission

        // Get form data
        const fr_nme = document.getElementById('name').value;
        const to_eml = document.getElementById('email').value;
        const yes_dt = document.getElementById('phone').value;
        const message = document.getElementById('message').value;

        // Send the email using EmailJS
        emailjs.send("contact_service", "contact_form", {
            from_name: to_eml,
            to_name: fr_nme,
            phone: yes_dt,
            message: message
        })
        .then(function(response) {
            console.log("Success", response);
            alert("Your message has been sent!");
        }, function(error) {
            console.log("Error", error);
            alert("There was an issue sending your message.");
        });
    });

    // Function to generate the temperament chart
    function generateTemperamentChart(extraversionScore, neuroticismScore, rad) {
        // Set up data for the graph
        const data = {
            datasets: [{
                label: 'Temperament',
                data: [{
                    x: extraversionScore,
                    y: neuroticismScore,
                    r: rad
                }],
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        };

        // Configuration for Chart.js
        const config = {
            type: 'bubble',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                },
                interaction: {
                    mode: null, // default interaction mode
                    intersect: false, // Disable hover interactions
                    enabled: false // Disable hover completely
                },
                scales: {
                    x: {
                        type: 'linear',
                        min: -40, // Adjusted to fit -1 to 1 for Extraversion
                        max: 40,
                        title: {
                            display: true,
                            text: 'Sociability'
                        },
                        grid: {
                            borderColor: 'black',
                            borderWidth: 1,
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                    },
                    y: {
                        type: 'linear',
                        min: -40, // Adjusted to fit -1 to 1 for Neuroticism (Reversed)
                        max: 40,
                        title: {
                            display: true,
                            text: 'Emotional Stability'
                        },
                        grid: {
                            borderColor: 'black',
                            borderWidth: 1,
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                    }
                },
                elements: {
                    point: {
                        radius: 10
                    }
                },
                // Custom drawing of quadrant lines
                animation: {
                    onComplete: function () {
                        const ctx = this.ctx; // Use this.ctx instead of this.chart
                        const chartArea = this.chartArea;
                        const centerX = (chartArea.left + chartArea.right) / 2;
                        const centerY = (chartArea.top + chartArea.bottom) / 2;

                        // Draw vertical line (E = 0)
                        ctx.beginPath();
                        ctx.moveTo(centerX, chartArea.top);
                        ctx.lineTo(centerX, chartArea.bottom);
                        ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
                        ctx.lineWidth = 2;
                        ctx.stroke();

                        // Draw horizontal line (N = 0)
                        ctx.beginPath();
                        ctx.moveTo(chartArea.left, centerY);
                        ctx.lineTo(chartArea.right, centerY);
                        ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
                        ctx.lineWidth = 2;
                        ctx.stroke();

                        // Labels for the quadrants
                        ctx.font = '16px Arial';
                        ctx.fillStyle = 'black';


                        const centerXqrt = (chartArea.left + chartArea.right) / 4;
                        const centerYqrt = (chartArea.top + chartArea.bottom) / 4;


                        // Bottom-right (Choleric) High Sociability and Low Emotional Stability
                        ctx.fillText('Choleric', centerX + centerXqrt - 60, centerY + centerYqrt - 10);
                        
                        // Top-right (Sanguine) High Sociability and High Emotional Stability
                        ctx.fillText('Sanguine', centerX + centerXqrt - 60, centerYqrt + 20);


                        // Top-left (Phlegmatic) Low Sociability and High Emotional Stability
                        ctx.fillText('Phlegmatic', centerXqrt, centerYqrt + 20);
                        
                        
                        // Bottom-left (Melancholic) Low Sociability and Low Emotional Stability
                        ctx.fillText('Melancholic', centerXqrt, centerY + centerYqrt - 10);
                        
                    }
                }
            }
        };

        // Render the chart
        const ctx = document.getElementById('temperamentChart').getContext('2d');
        new Chart(ctx, config);
    }

    function updateForm() {
        // Get the current date and time
        const currentDate = new Date();
        // Format the date and time (e.g., "YYYY-MM-DD HH:mm:ss")
        const formattedDate = currentDate.toISOString().split('T')[0];

        // Change the labels dynamically
        document.querySelector('label[for="name"]').textContent = "From:";  // Full Name to From: Joash
        document.querySelector('label[for="email"]').textContent = "To:";     // Email address to To: Jane
        document.querySelector('label[for="phone"]').textContent = "Date:"; // Phone number to Subject: Proposal
        document.querySelector('label[for="message"]').textContent = "Message:";    // Message stays as is
        document.getElementById('submitButton').innerHTML = "Yes";

        // Autofill the Contact Us form with the proposal
        document.getElementById('name').value = "Joash"; // From
        document.getElementById('email').value = "Jane"; // To
        document.getElementById('phone').value = formattedDate; // Date
        document.getElementById('message').value = `Hii!
            \nIt's crazy how we first met back in 2019, but it wasn't until December 2023 when we really reconnected with each other. I never imagined that one meeting would turn into something so special, and though we've been through highs and lows, I wouldn't trade any of it for anything.
            \nI know the distance between us now feels like it's miles and miles, pero it doesn't matter. What matters is how strong we've grown together despite everything--being apart, the tough days, and the times we really missed each other. You've made me realize na no matter how far apart we are, I always want to have you in my life.
            \nAlam mo, even andito ako sa Canada and ikaw nasa pinas, I am always keeping you close to me, close to my heart. I don't know what the future holds, pero one thing is for sure: I want to be with you through it all.
            \nWith that, I want to ask you officially: Jane, will you be my girlfriend?`;

        // Get the element
        const textarea = document.getElementById('message');
        // Adjust the height
        textarea.style.height = '20rem'; // Set the new height
        document.getElementById('submitButton').classList.remove('disabled');
    }

});
