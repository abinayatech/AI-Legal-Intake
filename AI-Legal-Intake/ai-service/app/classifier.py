from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
import re

TRAINING_DATA = [
    ("my employer fired me without notice",             "employment"),
    ("i was terminated without any reason",             "employment"),
    ("my salary has not been paid for 3 months",       "employment"),
    ("workplace harassment by my manager",              "employment"),
    ("wrongful dismissal from my job",                  "employment"),

    ("landlord refused to return my security deposit",  "property"),
    ("tenant is not paying rent",                       "property"),
    ("property boundary dispute with neighbour",        "property"),
    ("eviction notice received from landlord",          "property"),
    ("illegal construction on my land",                 "property"),

    ("vendor did not deliver goods as per agreement",   "contract"),
    ("client refusing to pay after project completion", "contract"),
    ("breach of contract by the other party",           "contract"),
    ("agreement was signed under false pretenses",      "contract"),
    ("contract terms were violated",                    "contract"),

    ("business partner cheated me out of money",       "dispute"),
    ("neighbour is causing damage to my property",     "dispute"),
    ("fraud committed by a company against me",        "dispute"),
    ("someone owes me money and refuses to pay",       "dispute"),
    ("defamation and false statements made about me",  "dispute"),

    ("company not following data protection rules",    "compliance"),
    ("tax filing violation notice received",           "compliance"),
    ("regulatory penalty imposed on my business",     "compliance"),
    ("license renewal rejected by authorities",       "compliance"),
    ("environmental compliance issue at my factory",  "compliance"),
]

DOCUMENTS = {
    "employment":  ["Employment contract", "Termination letter", "Pay slips (last 3 months)", "HR correspondence"],
    "property":    ["Title deed or lease agreement", "Property photos", "Landlord correspondence", "Payment history"],
    "contract":    ["Signed contract copy", "Amendment documents", "Payment receipts", "Communication records"],
    "dispute":     ["Evidence of the dispute", "Witness statements", "Prior agreements", "Communication history"],
    "compliance":  ["Regulatory notices", "Internal policy documents", "Audit reports", "Authority correspondence"],
}

URGENCY_KEYWORDS = {
    "high":   ["fired", "terminated", "eviction", "fraud", "cheated", "penalty", "illegal", "harassment"],
    "medium": ["dispute", "refused", "violated", "breach", "not paid", "rejected"],
}

texts, labels = zip(*TRAINING_DATA)
model = Pipeline([
    ('tfidf', TfidfVectorizer(ngram_range=(1, 2))),
    ('clf',   MultinomialNB()),
])
model.fit(texts, labels)


def classify_issue(description: str) -> dict:
    clean = re.sub(r'[^a-zA-Z0-9 ]', '', description.lower())

    probs      = model.predict_proba([clean])[0]
    confidence = float(round(max(probs), 2))
    category   = model.classes_[probs.argmax()]

    urgency = "low"
    for level, keywords in URGENCY_KEYWORDS.items():
        if any(word in clean for word in keywords):
            urgency = level
            break

    return {
        "category":            category,
        "urgency":             urgency,
        "confidence":          confidence,
        "suggested_documents": DOCUMENTS.get(category, []),
    }