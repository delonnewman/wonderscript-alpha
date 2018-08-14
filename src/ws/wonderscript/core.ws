(defmacro fn (args, &body)
  (cons 'fn*, (cons args body)))

(defmacro defn (name, args, &body)
  (cons 'def (cons name (cons 'fn (cons args body)))))
