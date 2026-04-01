;; basic objects
(defclass <object> () ())
(defclass <procedure> (object) ())
(defclass <lambda> (procedure) ())
(defclass <method> (procedure) ())
(defclass <message> (object) ())

;; types
(defclass <class> (object) ())
(defclass <protocol> (object) ())

;; numeric objects
(defclass <numeric> (object) ()) ;; abstract
(defclass <integer> (numeric) ())
(defclass <float> (numeric) ())
(defclass <rational> (numeric) ())

;; text objects
(defclass <char> (object) ())
(defclass <string> (object) ())

;; symbolic objects
(defclass <keyword> (object) ())
(defclass <symbol> (object) ())

;; collections
(defclass <list> (object) ())
(defclass <array> (object) ())
(defclass <map> (object) ())

(defclass <env> () ())

(defun analyze (form))
