let shuffledQuestions;

$(document).ready(function() {
    // Fetch and load the quiz questions using jQuery's $.getJSON()
    $.getJSON('assets/questions.json', function(questions) {
        const quizContainer = $('#quiz-questions');

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
            Extraversion: 0,
            Neuroticism: 0
        };
    
        // Collect answers
        for (let idx = 0; idx < shuffledQuestions.length; idx++) {
            const question = shuffledQuestions[idx];
            const selected = $(`input[name="${question.id}"]:checked`).val();
            if (!selected) {
                allAnswered = false;
                alert('Question #' + (idx + 1) + ' is not yet answered. Please answer all the questions before submitting.');
                break;
            } else {
                scores[question.category] += parseInt(selected); // Add score to the relevant category
            }
        };
    
        if (!allAnswered) {
            // Return if not all questions are answered
            return;
        }

        // Generate result text
        const resultText = `
            <h3>Your Results</h3>
            <p><strong>Extraversion:</strong> ${scores.Extraversion}</p>
            <p><strong>Neuroticism:</strong> ${scores.Neuroticism}</p>
        `;
    
        // Display results
        // $('#results').html(resultText);
        alert(resultText);
    });
});
