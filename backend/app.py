from flask import Flask, request, jsonify
from openai import OpenAI
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
openai = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def process_content_to_flashcards(content):
    """Process content through OpenAI and convert to flashcards"""
    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert on creating educational content. Convert the provided notes into key points that will be used for memorization and typing practice. Focus on the terms that have definitions. Each term should be one short sentence. Each exercise serves the purpose of a flashcard, so there is a front and back and the sentence structure is simple. The term title (front) comes before the text (back), and is in the format of Front: Back. Each flashcard should be on a newline"
                },
                {
                    "role": "user",
                    "content": content
                }
            ],
            max_tokens=4000
        )
        
        # Get the response text
        response_text = response.choices[0].message.content
        
        # Convert to flashcards
        flashcards = []
        for line in response_text.strip().split('\n'):
            if ':' in line:
                front, back = line.split(':', 1)
                flashcards.append({
                    'front': front.strip(),
                    'back': back.strip()
                })
        
        return flashcards
    except Exception as e:
        print(f"Error processing content: {str(e)}")
        raise

@app.route('/process', methods=['POST'])
def process():
    try:
        content = request.json.get('content')
        if not content:
            return jsonify({'error': 'No content provided'}), 400
        
        flashcards = process_content_to_flashcards(content)
        return jsonify({
            'success': True,
            'flashcards': flashcards,
            'quizId': f'demo-{int(time.time())}'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(port=5000)